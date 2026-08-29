"use client"

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import type { BlockDto } from "@/lib/shared/types";

interface Props {
  blocks: BlockDto[];
}

export function BlockCards({ blocks }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {blocks.map((block) => (
        <article
          key={block.id}
          className="group overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-card transition-shadow hover:shadow-lg"
        >
          <div className="relative h-52 w-full">
            <Image
              src={block.image}
              alt={block.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-5">
            <h2 className="font-heading text-xl font-normal text-text">
              {block.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
              <span>{block.roomCount} rooms</span>
              <span className="text-border">|</span>
              <span>{block.category}</span>
              <span className="text-border">|</span>
              <span>{block.view}</span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-muted">
              {block.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-text">
                From {formatINR(block.startingPrice)}
                <span className="ml-1 text-xs font-normal text-text-muted">
                  /night
                </span>
              </p>
              <Button asChild size="sm">
                <Link href={`/rooms/${block.slug}`}>Explore Rooms</Link>
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
