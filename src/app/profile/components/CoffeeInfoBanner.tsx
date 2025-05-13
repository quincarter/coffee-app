export const CoffeeInfoBanner = () => {
  return (
    <div
      style={{ marginInline: "auto" }}
      className={`flex alert alert-neutral text-sm mb-4 max-w-3xl self-center shadow-md rounded-lg`}
    >
      <p>
        Coffee Roasters and Coffees are now separate entities. You can add a new
        roaster and then add coffees to it. They are also shared with the entire
        BrewMe community for use in their brew profiles. <br /> <br />
        Right now it is very tedious to add roasters and coffees, but this is
        how the community will grow and thrive!
        <br />
        <br /> If you have any questions or feedback, please reach out to us on{" "}
        <a
          href="https://github.com/quincarter/coffee-app/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
};

export default CoffeeInfoBanner;
