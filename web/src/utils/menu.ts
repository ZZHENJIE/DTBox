export default [
  {
    table: "Calendar",
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
    table: "Help",
    value: [
      {
        label: "About",
        key: "/about",
      },
    ],
  },
];
