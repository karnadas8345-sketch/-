import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  SIGNS_BN, SIGNS_EN, SIGNS_HI, SIGNS_MR, SIGNS_GU, SIGNS_NE, SIGNS_OR,
  PLANETS_BN, PLANETS_HI, PLANETS_MR, PLANETS_GU, PLANETS_NE, PLANETS_OR
} from '../services/astrologyEngine';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Planet {
  id: string;
  name: { [key: string]: string };
  longitude: number;
  sign: { [key: string]: string };
  degree: number;
}

interface BirthChartProps {
  planets: Planet[];
  language: string;
  title: string;
  highlightPlanet?: string;
  theme?: 'dark' | 'light';
}

const SIGN_MAP: Record<string, string[]> = {
  bn: SIGNS_BN,
  en: SIGNS_EN,
  hi: SIGNS_HI,
  mr: SIGNS_MR,
  gu: SIGNS_GU,
  ne: SIGNS_NE,
  or: SIGNS_OR
};

const PLANET_NAME_MAP: Record<string, Record<string, string>> = {
  bn: PLANETS_BN,
  hi: PLANETS_HI,
  mr: PLANETS_MR,
  gu: PLANETS_GU,
  ne: PLANETS_NE,
  or: PLANETS_OR
};

const PLANET_SYMBOLS: Record<string, string> = {
  "Sun": "☉",
  "Moon": "☽",
  "Mercury": "☿",
  "Venus": "♀",
  "Mars": "♂",
  "Jupiter": "♃",
  "Saturn": "♄",
  "Rahu": "☊",
  "Ketu": "☋",
  "Ascendant": "Asc"
};

export default function BirthChart({ planets, language, title, highlightPlanet, theme = 'dark' }: BirthChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const currentSigns = SIGN_MAP[language] || SIGNS_EN;

  useEffect(() => {
    if (!svgRef.current || !planets.length) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.7;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Draw Zodiac Wheel
    const signArc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .startAngle((d, i) => (i * 30 * Math.PI) / 180)
      .endAngle((d, i) => ((i + 1) * 30 * Math.PI) / 180);

    // Draw segments
    g.selectAll(".sign-arc")
      .data(new Array(12).fill(0))
      .enter()
      .append("path")
      .attr("class", "sign-arc")
      .attr("d", signArc as any)
      .attr("fill", (d, i) => i % 2 === 0 ? (theme === 'dark' ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)") : "transparent")
      .attr("stroke", theme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)")
      .attr("stroke-width", 1);

    // Draw sign names/symbols
    g.selectAll(".sign-label")
      .data(new Array(12).fill(0))
      .enter()
      .append("text")
      .attr("transform", (d, i) => {
        const angle = (i * 30 + 15) * Math.PI / 180;
        const x = (innerRadius + (radius - innerRadius) / 2) * Math.sin(angle);
        const y = -(innerRadius + (radius - innerRadius) / 2) * Math.cos(angle);
        return `translate(${x}, ${y})`;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", theme === 'dark' ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)")
      .attr("font-size", "9px")
      .attr("font-weight", "600")
      .attr("letter-spacing", "0.05em")
      .text((d, i) => currentSigns[i]);

    // Draw inner circle
    g.append("circle")
      .attr("r", innerRadius)
      .attr("fill", theme === 'dark' ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.5)")
      .attr("stroke", theme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)")
      .attr("stroke-width", 1);

    // Draw center point
    g.append("circle")
      .attr("r", 4)
      .attr("fill", "#10b981")
      .attr("opacity", 0.5);

    // Draw planet positions
    // In this coordinate system (D3 standard for arcs):
    // 0 degrees is at 12 o'clock, clockwise.
    // Astrology: 0 degrees Aries is usually East (9 o'clock) or Top (12 o'clock).
    // Let's stick with 0 degrees = 12 o'clock for now as it matches the arc logic above.
    
    planets.forEach((planet) => {
      const angle = (planet.longitude * Math.PI) / 180;
      const x = (innerRadius - 30) * Math.sin(angle);
      const y = -(innerRadius - 30) * Math.cos(angle);
      const isHighlighted = highlightPlanet === planet.id;

      const planetGroup = g.append("g")
        .attr("transform", `translate(${x}, ${y})`);

      if (isHighlighted) {
        // Add a glow filter
        const filter = svg.append("defs")
          .append("filter")
          .attr("id", "glow")
          .attr("x", "-50%")
          .attr("y", "-50%")
          .attr("width", "200%")
          .attr("height", "200%");
        
        filter.append("feGaussianBlur")
          .attr("stdDeviation", "3")
          .attr("result", "blur");
        
        filter.append("feComposite")
          .attr("in", "SourceGraphic")
          .attr("in2", "blur")
          .attr("operator", "over");

        // Outer pulsing ring
        planetGroup.append("circle")
          .attr("r", 20)
          .attr("fill", "none")
          .attr("stroke", "#10b981")
          .attr("stroke-width", 2)
          .attr("opacity", 0.5)
          .append("animate")
          .attr("attributeName", "r")
          .attr("values", "15;25;15")
          .attr("dur", "1.5s")
          .attr("repeatCount", "indefinite");

        planetGroup.append("circle")
          .attr("r", 20)
          .attr("fill", "none")
          .attr("stroke", "#10b981")
          .attr("stroke-width", 1)
          .append("animate")
          .attr("attributeName", "opacity")
          .attr("values", "0.8;0;0.8")
          .attr("dur", "1.5s")
          .attr("repeatCount", "indefinite");
          
        // Background glow
        planetGroup.append("circle")
          .attr("r", 12)
          .attr("fill", "#10b981")
          .attr("opacity", 0.2)
          .style("filter", "url(#glow)");
      }

      // Planet Symbol/Name
      planetGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", isHighlighted ? "#10b981" : (planet.id === 'Moon' ? '#818cf8' : planet.id === 'Sun' ? '#fbbf24' : '#10b981'))
        .attr("font-size", isHighlighted ? "14px" : "12px")
        .attr("font-weight", "bold")
        .style("text-shadow", theme === 'dark' ? "0 0 10px rgba(0,0,0,0.5)" : "none")
        .text(planet.name[language] || planet.name['en'] || planet.id.substring(0, 2));

      // Degree label
      planetGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.6em")
        .attr("fill", isHighlighted ? "#10b981" : (theme === 'dark' ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"))
        .attr("font-size", "8px")
        .text(`${Math.floor(planet.degree)}°`);
      
      // Line to planet
      g.append("line")
        .attr("x1", (innerRadius - 10) * Math.sin(angle))
        .attr("y1", -(innerRadius - 10) * Math.cos(angle))
        .attr("x2", innerRadius * Math.sin(angle))
        .attr("y2", -innerRadius * Math.cos(angle))
        .attr("stroke", isHighlighted ? "#10b981" : (planet.id === 'Moon' ? '#818cf8' : planet.id === 'Sun' ? '#fbbf24' : '#10b981'))
        .attr("stroke-width", isHighlighted ? 3 : 2)
        .attr("opacity", isHighlighted ? 1 : 0.6);
    });

    // Draw lines from center to planets (optional, maybe too messy)
    /*
    planets.forEach(planet => {
       const angle = (planet.longitude * Math.PI) / 180;
       g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", innerRadius * Math.cos(angle))
        .attr("y2", innerRadius * Math.sin(angle))
        .attr("stroke", "rgba(255, 255, 255, 0.05)")
        .attr("stroke-width", 0.5);
    });
    */

  }, [planets, language, theme]);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-3xl p-6 border transition-all",
      theme === 'dark' ? "bg-black/20 border-white/5" : "bg-white border-black/5 shadow-sm"
    )}>
      <svg 
        ref={svgRef} 
        width="400" 
        height="400" 
        viewBox="0 0 400 400"
        className="max-w-full h-auto"
      />
      <div className="mt-4 text-[10px] text-zinc-500 uppercase tracking-widest">
        {title}
      </div>
    </div>
  );
}
