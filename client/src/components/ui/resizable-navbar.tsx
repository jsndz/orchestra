"use client";
import { cn } from "../lib/utils";
import { Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import React, { useRef, useState } from "react";


export const Navbar = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ target: ref });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    setVisible(v > 100);
  });

  return (
    <motion.div
      ref={ref}
      className={cn("sticky top-20 inset-x-0 z-40", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as any, { visible })
          : child,
      )}
    </motion.div>
  );
};


export const NavBody = ({
  children,
  className,
  visible,
}: {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      style={{ minWidth: "800px" }}
      className={cn(
        "relative mx-auto hidden max-w-7xl items-center justify-between rounded-full px-4 py-2 lg:flex",
        visible && "bg-neutral-900/80 border border-neutral-700",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};


export const NavItems = ({
  items,
  className,
  onItemClick,
}: {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden items-center justify-center gap-2 text-sm lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          key={idx}
          href={item.link}
          onClick={onItemClick}
          onMouseEnter={() => setHovered(idx)}
          className="relative px-4 py-2 text-white/70 hover:text-white"
        >
          {hovered === idx && (
            <motion.div
              layoutId="nav-hover"
              className="absolute inset-0 rounded-full bg-neutral-800/60"
            />
          )}
          <span className="relative z-10">{item.name}</span>
        </a>
      ))}
    </div>
  );
};


export const MobileNav = ({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible?: boolean;
}) => {
  return (
    <motion.div
      animate={{ y: visible ? 20 : 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className="relative mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col lg:hidden"
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className="flex w-full items-center justify-between">{children}</div>
);

export const MobileNavMenu = ({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-x-0 top-16 z-50 flex flex-col gap-4 rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-6"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) =>
  isOpen ? (
    <X className="text-white/80" onClick={onClick} />
  ) : (
    <Menu className="text-white/80" onClick={onClick} />
  );

/* -------------------------------- Logo -------------------------------- */

export const NavbarLogo = () => {
  return (
    <a href="#" className="relative z-10 flex items-center px-2 py-1">
      <img src="./logo.png" alt="logo" width={160} />
    </a>
  );
};


export const NavbarButton = ({
  children,
  className,
  variant = "primary",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const base =
    "px-4 py-2 rounded-md text-sm font-medium transition inline-flex items-center justify-center";

  const variants = {
    primary: "bg-[#E1F4F3] text-neutral-900 hover:bg-[#d4ecea]",
    secondary: "bg-transparent text-white/70 hover:text-white",
    dark: "bg-neutral-800 text-white hover:bg-neutral-700",
  };

  return (
    <button
      {...props}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </button>
  );
};