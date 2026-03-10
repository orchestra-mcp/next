declare module 'animejs' {
  interface AnimeParams {
    targets?: string | object | HTMLElement | SVGElement | NodeList | null
    duration?: number
    delay?: number | ((el: HTMLElement, i: number, total: number) => number)
    easing?: string
    elasticity?: number
    round?: number | boolean
    begin?: (anim: object) => void
    update?: (anim: object) => void
    complete?: (anim: object) => void
    loop?: number | boolean
    direction?: 'normal' | 'reverse' | 'alternate'
    autoplay?: boolean
    translateX?: number | string | (number | string)[]
    translateY?: number | string | (number | string)[]
    opacity?: number | (number | string)[]
    scale?: number | (number | string)[]
    [key: string]: unknown
  }

  interface AnimeStaggerOptions {
    start?: number
    from?: number | string
    direction?: 'normal' | 'reverse'
    easing?: string
    grid?: number[]
    axis?: 'x' | 'y'
  }

  interface AnimeInstance {
    play(): void
    pause(): void
    restart(): void
    reverse(): void
    seek(time: number): void
    finished: Promise<void>
  }

  function anime(params: AnimeParams): AnimeInstance
  namespace anime {
    function stagger(value: number | string, options?: AnimeStaggerOptions): (el: HTMLElement, i: number, total: number) => number
    function remove(targets: string | object | HTMLElement | SVGElement | NodeList): void
  }

  export default anime
}
