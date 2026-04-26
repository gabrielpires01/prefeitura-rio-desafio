import Image from "next/image";
import cityLogo from "@/assets/city-logo.png";

export function CityLogo() {
    return (
        <Image
            src={cityLogo}
            alt="City Logo"
            width={200}
            height={200}
            style={{ borderRadius: "50%" }}
        />
    );
}
