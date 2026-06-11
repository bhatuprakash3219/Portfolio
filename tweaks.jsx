/* Tweaks for the portfolio — accent palette, hero motion, cursor, density, theme */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#7C3AED", "#06B6D4", "#00F5D4"],
  "heroMotion": "particles",
  "cursor": true,
  "density": "luxurious",
  "grain": true
}/*EDITMODE-END*/;

const PALETTES = [
  ["#7C3AED", "#06B6D4", "#00F5D4"], // signature purple/cyan
  ["#2563EB", "#22D3EE", "#38BDF8"], // electric blue
  ["#EC4899", "#8B5CF6", "#F0ABFC"], // magenta/violet
  ["#10B981", "#06B6D4", "#A3E635"], // emerald/lime
];

function applyPalette(p) {
  const root = document.documentElement.style;
  root.setProperty('--accent', p[0]);
  root.setProperty('--accent-2', p[1]);
  root.setProperty('--accent-3', p[2]);
  root.setProperty('--accent-4', p[0]);
  if (window.__portfolio) window.__portfolio.setHeroColors(p[2], p[0]);
}

function applyDensity(d) {
  const root = document.documentElement.style;
  if (d === 'compact') {
    root.setProperty('--section-y', 'clamp(64px, 9vw, 130px)');
    root.setProperty('--pad', 'clamp(18px, 3vw, 56px)');
  } else {
    root.setProperty('--section-y', 'clamp(96px, 14vw, 200px)');
    root.setProperty('--pad', 'clamp(20px, 4vw, 80px)');
  }
}

function applyHeroMotion(m) {
  const canvas = document.getElementById('heroCanvas');
  const orb = document.querySelector('.hero-orb');
  if (!canvas) return;
  if (m === 'particles') { canvas.style.display = ''; if (orb) orb.style.opacity = ''; }
  else if (m === 'orb') { canvas.style.display = 'none'; if (orb) orb.style.opacity = '0.85'; }
  else if (m === 'minimal') { canvas.style.display = 'none'; if (orb) orb.style.opacity = '0.25'; }
}

function applyCursor(on) {
  const c = document.getElementById('cursor');
  const r = document.getElementById('cursorRing');
  const touch = window.matchMedia('(hover: none)').matches;
  if (!c || !r) return;
  if (on && !touch) {
    c.style.display = ''; r.style.display = '';
    document.body.style.cursor = 'none';
  } else {
    c.style.display = 'none'; r.style.display = 'none';
    document.body.style.cursor = 'auto';
  }
}

function applyGrain(on) {
  document.body.style.setProperty('--grain-on', on ? '1' : '0');
  let el = document.getElementById('__grainKill');
  if (!on) {
    if (!el) {
      el = document.createElement('style');
      el.id = '__grainKill';
      el.textContent = 'body::after{opacity:0 !important}';
      document.head.appendChild(el);
    }
  } else if (el) { el.remove(); }
}

function PortfolioTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => { applyPalette(t.palette); }, [t.palette]);
  React.useEffect(() => { applyDensity(t.density); }, [t.density]);
  React.useEffect(() => { applyHeroMotion(t.heroMotion); }, [t.heroMotion]);
  React.useEffect(() => { applyCursor(t.cursor); }, [t.cursor]);
  React.useEffect(() => { applyGrain(t.grain); }, [t.grain]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Accent palette" />
      <TweakColor
        label="Palette"
        value={t.palette}
        options={PALETTES}
        onChange={(v) => setTweak('palette', v)}
      />

      <TweakSection label="Hero" />
      <TweakRadio
        label="Motion"
        value={t.heroMotion}
        options={['particles', 'orb', 'minimal']}
        onChange={(v) => setTweak('heroMotion', v)}
      />

      <TweakSection label="Feel" />
      <TweakRadio
        label="Density"
        value={t.density}
        options={['luxurious', 'compact']}
        onChange={(v) => setTweak('density', v)}
      />
      <TweakToggle
        label="Custom cursor"
        value={t.cursor}
        onChange={(v) => setTweak('cursor', v)}
      />
      <TweakToggle
        label="Film grain"
        value={t.grain}
        onChange={(v) => setTweak('grain', v)}
      />
    </TweaksPanel>
  );
}

(function mountTweaks() {
  function go() {
    const host = document.createElement('div');
    host.id = '__tweaks_root';
    document.body.appendChild(host);
    ReactDOM.createRoot(host).render(<PortfolioTweaks />);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
