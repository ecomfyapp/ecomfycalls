import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/dashboard",
    name: "EcomfyCalls",
    short_name: "EcomfyCalls",
    description: "Recibe y atiende llamadas de clientes interesados en seguros.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f6f9ff",
    theme_color: "#173785",
    orientation: "any",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/images/ecomfy-lead-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
