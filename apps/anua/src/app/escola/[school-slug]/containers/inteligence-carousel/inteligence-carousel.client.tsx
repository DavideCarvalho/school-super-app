"use client";

import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";

export function InteligenceCarouselClient() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </CarouselContent>
    </Carousel>
  );
}
