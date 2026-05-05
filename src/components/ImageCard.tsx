"use client";

import { motion } from "framer-motion";
import React from "react";
import { Link2 } from "lucide-react";

interface ImageCardProps {
  title: string;
  url: string;
  imageUrl: string;
  delay?: number;
}

export default function ImageCard({ title, url, imageUrl, delay = 0.2 }: ImageCardProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full rounded-3xl overflow-hidden aspect-[4/3] block mb-4 group shadow-xl"
    >
      <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
      
      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
        <Link2 className="w-4 h-4 text-white" />
      </div>

      <div className="absolute bottom-6 w-full text-center">
        <h3 className="text-white font-bold text-xl tracking-wider px-4">{title}</h3>
      </div>
    </motion.a>
  );
}
