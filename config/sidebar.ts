import { IconChartPie, IconBuilding, IconBrain } from "@tabler/icons-react";

export const navigation = {
  main: [
    {
      title: "Foundation",
      url: "/foundation",
      icon: IconBuilding,
      isActive: true,
      items: [
        {
          title: "Initialize",
          url: "/initialize",
        },
        {
          title: "Connect",
          url: "/connect",
        },
        {
          title: "Configuration",
          url: "/configuration",
          items: [
            {
              title: "Core View",
              url: "/core-view",
            },
            {
              title: "GL Mapping",
              url: "/gl-mapping",
            },
          ],
        },
        {
          title: "Structure",
          url: "/structure",
          items: [
            {
              title: "Branch",
              url: "/branch",
            },
          ],
        },
        {
          title: "Threshold",
          url: "/threshold",
        },
      ],
    },
    {
      title: "Intelligence",
      url: "/intelligence",
      icon: IconBrain,
      isActive: false,
      items: [
        {
          title: "Enrich",
          url: "/enrich",
          items: [
            {
              title: "Holidays",
              url: "/holidays",
            },
            {
              title: "Weather",
              url: "/weather",
            },
            {
              title: "Events",
              url: "/events",
            },
            {
              title: "Promotions",
              url: "/promotions",
            },
            {
              title: "Signals",
              url: "/signals",
            },
          ],
        },
        {
          title: "Model",
          url: "#",
        },
        {
          title: "Tuning",
          url: "#",
        },
        {
          title: "Validate",
          url: "#",
        },
      ],
    },
    {
      title: "Strategy",
      url: "/strategy",
      icon: IconChartPie,
      isActive: false,
      items: [
        {
          title: "Strategize",
          url: "#",
        },
        {
          title: "Deploy",
          url: "#",
        },
      ],
    },
  ],

  misc: [],
};
