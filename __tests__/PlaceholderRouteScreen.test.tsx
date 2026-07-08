import { render } from "@testing-library/react-native";

import { placeholderRoutes } from "@/constants/placeholders";
import { PlaceholderRouteScreen } from "@/features/app-shell/screens/PlaceholderRouteScreen";

describe("PlaceholderRouteScreen", () => {
  it("renders the route title and description", async () => {
    const { getByText } = await render(
      <PlaceholderRouteScreen route={placeholderRoutes.collection} />,
    );

    expect(getByText("Collection")).toBeTruthy();
    expect(getByText(/copy-centric collection browser/i)).toBeTruthy();
  });
});
