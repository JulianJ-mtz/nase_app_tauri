import { OnlineStatusIndicator } from "@/components/OnlineStatusIndicator";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
    return (
        <div className="flex-col justify-center p-10">
            hola
            <OnlineStatusIndicator />
        </div>
    );
}
