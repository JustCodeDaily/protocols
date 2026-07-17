"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { FiThumbsUp as ThumbsUp, FiThumbsDown as ThumbsDown } from "react-icons/fi";
export function HabitCard({ habit, isTop, onSwipe, zIndex }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-45, 45]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);
  const yesOpacity = useTransform(x, [0, 150], [0, 1]);
  const noOpacity = useTransform(x, [0, -150], [0, 1]);

  const handleDragEnd = (e, info) => {
    const threshold = 180;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  }

  return <motion.div
    className="absolute top-0 left-0 right-0 h-96 w-full max-w-sm mx-auto"
    style={{
      x,
      rotate,
      opacity,
      zIndex
    }}
    drag={isTop ? "x" : false}
    dragConstraints={{ left: 0, right: 0 }}
    onDragEnd={handleDragEnd}
    animate={{
      scale: isTop ? 1 : 0.95,
      y: isTop ? 0 : 20
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
      <div className="relative flex h-full w-full flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-xl shadow-zinc-200/50 dark:bg-zinc-900 dark:shadow-none border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        
        <motion.div style={{ opacity: yesOpacity }} className="absolute top-8 right-8 rotate-12 rounded-full bg-emerald-100/50 dark:bg-emerald-500/20 p-3 text-emerald-500 pointer-events-none">
          <ThumbsUp className="h-8 w-8" strokeWidth={2.5} />
        </motion.div>

        <motion.div style={{ opacity: noOpacity }} className="absolute top-8 left-8 -rotate-12 rounded-full bg-rose-100/50 dark:bg-rose-500/20 p-3 text-rose-500 pointer-events-none">
          <ThumbsDown className="h-8 w-8" strokeWidth={2.5} />
        </motion.div>

        <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 z-10">
          {habit.question}
        </h3>
        <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-500 font-medium z-10">
          {habit.title}
        </p>
      </div>
    </motion.div>;
}
