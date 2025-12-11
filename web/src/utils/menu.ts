export default [
  {
    table: "Screener",
    type: "warning",
    value: [
      {
        label: "Finviz",
        children: [
          {
            label: "Query",
            key: "/screener/finviz/query",
          },
          {
            label: "Result",
            key: "/screener/finviz/result",
          },
          {
            label: "Script",
            key: "/screener/finviz/script",
          },
        ],
        key: "screener_finviz",
      },
    ],
  },
  {
    table: "Calendar",
    type: "info",
    value: [
      {
        label: "Economy",
        children: [
          {
            label: "Finviz",
            key: "/calendar/economy/finviz",
          },
        ],
        key: "calendar_economy",
      },
      {
        label: "IPO",
        children: [
          {
            label: "Iposcoop",
            key: "/calendar/ipo/iposcoop",
          },
        ],
        key: "calendar_ipo",
      },
      {
        label: "SPAC",
        children: [
          {
            label: "Research",
            key: "/calendar/spac/research",
          },
        ],
        key: "calendar_spac",
      },
    ],
  },
  {
    table: "Experimental",
    type: "warning",
    value: [
      {
        label: "Chart",
        key: "/experimental/chart",
      },
    ],
  },
];
