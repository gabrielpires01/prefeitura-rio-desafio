import Image from "next/image";
import cityLogo from "@/assets/city-logo.png";

interface CityLogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export function CityLogo({ className, width = 200, height = 200 }: CityLogoProps) {
    return (
        <Image
            src={cityLogo}
            alt="City Logo"
            width={width}
            height={height}
            className={className}
            style={{ borderRadius: "50%" }}
        />
    );
}
