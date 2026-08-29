import confetti from "canvas-confetti"

const CORES_MARCA = ["#E8560A", "#1A1A1A", "#F3F4F6", "#FDBA74"]

/** Disparo rápido de confete (~1-2s) para celebrar uma ação concluída com sucesso. */
export function celebrar() {
  confetti({
    particleCount: 100,
    spread: 70,
    startVelocity: 35,
    origin: { y: 0.6 },
    colors: CORES_MARCA,
    disableForReducedMotion: true,
  })
}
