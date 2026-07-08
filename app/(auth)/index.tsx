import { placeholderRoutes } from "@/constants/placeholders";
import { PlaceholderRouteScreen } from "@/features/app-shell/screens/PlaceholderRouteScreen";

export default function AuthPlaceholderRoute() {
  return <PlaceholderRouteScreen route={placeholderRoutes.auth} />;
}
