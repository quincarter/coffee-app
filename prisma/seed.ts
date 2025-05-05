import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Define brewing devices to add
  const brewingDevices = [
    {
      name: "Espresso Machine",
      description:
        "Brewing device that forces pressurized hot water through finely ground coffee beans to produce concentrated coffee.",
      image:
        "https://images.unsplash.com/photo-1616035596458-2338800a1ff2?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "Pour Over",
      description:
        "Manual brewing method where hot water is poured over ground coffee in a filter, allowing it to drip into a vessel below.",
      image:
        "https://images.unsplash.com/photo-1593652023641-56dbabbb5e37?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "AeroPress",
      description:
        "Manual brewing device that uses air pressure to extract coffee through a paper filter.",
      image:
        "https://images.unsplash.com/photo-1660292265700-b9d0c7fe0701?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "Siphon",
      description:
        "Vacuum brewing method that uses vapor pressure and vacuum to brew coffee in a visually dramatic way.",
      image:
        "https://images.unsplash.com/photo-1543594552-ecca2f9d9520?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "Drip Machine",
      description:
        "Automatic brewing device that drips hot water over ground coffee in a filter basket.",
      image:
        "https://images.unsplash.com/photo-1621555470436-d36e9683bae5?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "Cold Brew",
      description:
        "Method of brewing coffee using cold water over an extended period (12-24 hours) to produce a smooth, less acidic coffee concentrate.",
      image:
        "https://images.unsplash.com/photo-1558122104-355edad709f6?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "French Press",
      description:
        "Immersion brewing method using a plunger with a metal mesh filter to separate the grounds from the coffee.",
      image:
        "https://images.unsplash.com/photo-1708127368781-cd5f069a90a5?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "Moka Pot",
      description:
        "Stovetop brewing device that passes boiling water pressurized by steam through ground coffee.",
      image:
        "https://images.unsplash.com/photo-1579207789985-634b07150124?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "Turkish Coffee",
      description:
        "Method of brewing very finely ground coffee in a small pot (cezve or ibrik) until it foams.",
      image:
        "https://plus.unsplash.com/premium_photo-1732818135469-3bfc10ed83a2?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "Vietnamese Phin",
      description:
        "Traditional metal filter that sits on top of a cup, slowly dripping coffee, often served with condensed milk.",
      image:
        "https://images.unsplash.com/photo-1664515725366-e8328e9dc834?auto=format&fit=crop&q=80&w=1000",
    },
    {
      name: "Percolator",
      description:
        "Coffee pot that continuously cycles boiling water through the grounds using gravity until the desired strength is achieved.",
      image:
        "https://gallery.yopriceville.com/var/resizes/Free-Clipart-Pictures/Coffee-PNG/Coffeepot_PNG_Clipart.png?m=1629830718",
    },
    {
      name: "Gooseneck Kettle",
      description:
        "Specialized kettle with a long, curved spout that provides precise control over water flow for pour-over brewing methods.",
      image:
        "https://images.unsplash.com/photo-1579752898926-3bcbc125ae2e?auto=format&fit=crop&q=80&w=1000",
    },
  ];

  console.log("Starting to seed brewing devices...");

  // Check for existing devices to avoid duplicates
  for (const device of brewingDevices) {
    const existingDevice = await prisma.brewingDevice.findFirst({
      where: { name: device.name },
    });

    if (!existingDevice) {
      await prisma.brewingDevice.create({
        data: device,
      });
      console.log(`Added brewing device: ${device.name}`);
    } else {
      console.log(`Skipping existing device: ${device.name}`);
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
