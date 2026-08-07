use chrono::{NaiveDateTime, TimeZone, Utc};
use finviz_sdk::stock::Item;
use image::{ExtendedColorType, ImageEncoder, codecs::png::PngEncoder};
use plotters::prelude::*;

fn parse_date(s: &str) -> Result<chrono::DateTime<Utc>, String> {
    let cleaned = s.replace(" PM", "").replace(" AM", "");
    if let Ok(dt) = NaiveDateTime::parse_from_str(&cleaned, "%m/%d/%Y %H:%M") {
        return Ok(Utc.from_utc_datetime(&dt));
    }
    if let Ok(date) = chrono::NaiveDate::parse_from_str(&cleaned, "%m/%d/%Y") {
        return Ok(Utc.from_utc_datetime(&date.and_hms_opt(0, 0, 0).unwrap()));
    }
    Err(format!("Invalid date: {}", s))
}

pub fn render_kline(bars: &[Item], symbol: &str) -> Result<Vec<u8>, String> {
    if bars.is_empty() {
        return Err("No data available".to_string());
    }

    let (width, height): (u32, u32) = (1024, 768);
    let mut rgb_buffer = vec![0u8; (width * height * 3) as usize];

    let mut data: Vec<_> = bars.iter().collect();
    data.reverse();

    let dates: Vec<chrono::DateTime<Utc>> = data
        .iter()
        .map(|b| parse_date(&b.date))
        .collect::<Result<_, _>>()?;

    let from_date = *dates.first().unwrap();
    let to_date = *dates.last().unwrap();
    let duration = to_date - from_date;
    let is_intraday = data.len() >= 2
        && (dates[1] - dates[0]) < chrono::Duration::hours(24);

    let padding = if is_intraday {
        (duration / 100).max(chrono::Duration::minutes(10))
    } else {
        (duration / 50).max(chrono::Duration::hours(1))
    };
    let x_min = from_date - padding;
    let x_max = to_date + padding;

    let chart_x_area = (width as i32 - 130) as u32;
    let fill_ratio = if is_intraday { 80 } else { 60 };
    let candle_width = (chart_x_area / data.len() as u32 * fill_ratio / 100).max(1);

    let price_low = data.iter().map(|b| b.low).fold(f64::MAX, f64::min);
    let price_high = data.iter().map(|b| b.high).fold(f64::MIN, f64::max);
    let price_padding = (price_high - price_low) * 0.1;

    let vol_max = data.iter().map(|b| b.volume).max().unwrap_or(1) as f64;

    {
        let root = BitMapBackend::with_buffer(&mut rgb_buffer, (width, height))
            .into_drawing_area();
        root.fill(&WHITE).map_err(|e| e.to_string())?;

        let (upper, lower) = root.split_vertically((height as f64 * 0.7) as i32);

        let mut chart = ChartBuilder::on(&upper)
            .caption(symbol.to_string(), ("sans-serif", 36).into_font())
            .x_label_area_size(30)
            .y_label_area_size(60)
            .build_cartesian_2d(
                x_min..x_max,
                (price_low - price_padding)..(price_high + price_padding),
            )
            .map_err(|e| e.to_string())?;

        chart
            .configure_mesh()
            .light_line_style(WHITE.mix(0.3))
            .x_label_formatter(&move |d: &chrono::DateTime<Utc>| {
                if is_intraday {
                    d.format("%H:%M").to_string()
                } else {
                    d.format("%m/%d").to_string()
                }
            })
            .y_label_formatter(&|v| format!("{:.2}", v))
            .draw()
            .map_err(|e| e.to_string())?;

        let candles: Vec<_> = data
            .iter()
            .zip(dates.iter())
            .map(|(b, &dt)| {
                CandleStick::new(
                    dt,
                    b.open,
                    b.high,
                    b.low,
                    b.close,
                    GREEN.filled(),
                    RED,
                    candle_width,
                )
            })
            .collect();
        chart.draw_series(candles).map_err(|e| e.to_string())?;

        let mut vol_chart = ChartBuilder::on(&lower)
            .x_label_area_size(30)
            .y_label_area_size(50)
            .build_cartesian_2d(x_min..x_max, 0f64..(vol_max * 1.1))
            .map_err(|e| e.to_string())?;

        vol_chart
            .configure_mesh()
            .light_line_style(WHITE.mix(0.3))
            .y_label_formatter(&|v| {
                let v = *v;
                if v >= 1_000_000_000.0 {
                    format!("{:.1}B", v / 1_000_000_000.0)
                } else if v >= 1_000_000.0 {
                    format!("{:.1}M", v / 1_000_000.0)
                } else {
                    format!("{:.0}", v)
                }
            })
            .draw()
            .map_err(|e| e.to_string())?;

        let secs_per_bar = (duration.num_seconds() / data.len() as i64 * fill_ratio as i64 / 100 / 2).max(30);
        let bar_dur = chrono::Duration::seconds(secs_per_bar);

        let vol_bars: Vec<_> = data
            .iter()
            .zip(dates.iter())
            .map(|(b, &dt)| {
                let color = if b.close >= b.open {
                    RGBAColor(0, 200, 0, 0.8)
                } else {
                    RGBAColor(200, 0, 0, 0.8)
                };
                Rectangle::new(
                    [(dt - bar_dur, 0.0), (dt + bar_dur, b.volume as f64)],
                    color.filled(),
                )
            })
            .collect();
        vol_chart.draw_series(vol_bars).map_err(|e| e.to_string())?;

        root.present().map_err(|e| e.to_string())?;
    }

    let pixel_count = (width * height) as usize;
    let mut rgba = Vec::with_capacity(pixel_count * 4);
    for chunk in rgb_buffer.chunks(3) {
        rgba.extend_from_slice(&[chunk[0], chunk[1], chunk[2], 255]);
    }

    let mut png = Vec::new();
    let encoder = PngEncoder::new(&mut png);
    encoder
        .write_image(&rgba, width, height, ExtendedColorType::Rgba8)
        .map_err(|e| e.to_string())?;

    Ok(png)
}
