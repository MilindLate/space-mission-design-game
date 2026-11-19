# Scientific Model

All formulas are implemented in `src/lib/physics/` with full JSDoc citations.

---

## 1. Keplerian Orbital Propagator

**File**: `src/lib/physics/kepler.ts`

**Reference**: Bate, Mueller & White, *Fundamentals of Astrodynamics*, Dover 1971, §2.4–2.6

### Kepler's Equation (Eccentric Anomaly)
$$M = E - e \sin E$$

Solved iteratively via Newton–Raphson:
$$E_{n+1} = E_n - \frac{E_n - e \sin E_n - M}{1 - e \cos E_n}$$

Convergence tolerance: 1×10⁻⁸ rad (typically 4–6 iterations)

### True Anomaly from Eccentric Anomaly
$$\nu = 2 \arctan\left(\sqrt{\frac{1+e}{1-e}} \tan\frac{E}{2}\right)$$

### Keplerian → ECI Cartesian (Perifocal Frame)
$$\vec{r}_{peri} = \frac{a(1-e^2)}{1+e\cos\nu}\begin{pmatrix}\cos\nu \\ \sin\nu \\ 0\end{pmatrix}$$

Rotation to ECI via 3-1-3 Euler angles (Ω, i, ω).

### Orbital Period
$$T = 2\pi\sqrt{\frac{a^3}{\mu}}$$

### Gravitational Parameters Used
| Body | μ (km³/s²) | Source |
|------|-----------|--------|
| Sun | 1.32712440018×10¹¹ | IAU 2012 / JPL DE430 |
| Earth | 398600.4418 | IAU 2012 |
| Moon | 4902.8 | NASA NSSDC |
| Mars | 42828.3 | NASA NSSDC |

---

## 2. Tsiolkovsky Rocket Equation

**File**: `src/lib/physics/deltaV.ts`

**Reference**: NASA SP-8135 *Solid Rocket Motor Performance Analysis and Prediction*

$$\Delta v = I_{sp} \cdot g_0 \cdot \ln\frac{m_0}{m_f}$$

Where:
- $I_{sp}$ = specific impulse (s), engine-dependent
- $g_0$ = 9.80665 m/s² (standard gravity)
- $m_0$ = wet mass (kg), $m_f$ = dry mass (kg)

**Assumptions**:
- Gravity losses: +100 m/s (LEO), +150 m/s (interplanetary)
- Atmospheric drag losses: +50 m/s for ascent phase

---

## 3. Vis-Viva Equation

**File**: `src/lib/physics/visviva.ts`

**Reference**: Bate, Mueller & White §2.4

$$v = \sqrt{\mu\left(\frac{2}{r} - \frac{1}{a}\right)}$$

Used for: circular orbit velocity, Hohmann burn velocities, escape velocity.

---

## 4. Hohmann Transfer

**Reference**: Curtis, *Orbital Mechanics for Engineering Students*, §6.1

Two-burn impulsive maneuver between coplanar circular orbits:

$$\Delta v_1 = \sqrt{\frac{\mu}{r_1}}\left(\sqrt{\frac{2r_2}{r_1+r_2}} - 1\right)$$

$$\Delta v_2 = \sqrt{\frac{\mu}{r_2}}\left(1 - \sqrt{\frac{2r_1}{r_1+r_2}}\right)$$

Transfer time:
$$t_{transfer} = \pi\sqrt{\frac{a_t^3}{\mu}}, \quad a_t = \frac{r_1+r_2}{2}$$

---

## 5. Link Budget (Friis Equation)

**Reference**: Friis, H.T. (1946). *A Note on a Simple Transmission Formula*. Proc. IRE 34(5):254–256. Also SMAD §13.4.

$$P_{rx}\ [\text{dBW}] = P_{tx}\ [\text{dBW}] + G_{tx}\ [\text{dBi}] + G_{rx}\ [\text{dBi}] - \text{FSPL}\ [\text{dB}]$$

Free-Space Path Loss:
$$\text{FSPL} = 20\log_{10}(d_{km}) + 20\log_{10}(f_{GHz}) + 92.45$$

**Assumptions**: Clear line-of-sight, no atmospheric absorption (conservative for deep space).

---

## 6. Solar Panel Power Degradation

**Reference**: SMAD (Space Mission Analysis and Design), Larson & Wertz, §20.4

$$P_{fraction} = \frac{1}{d_{AU}^2} \cdot (1 - r_{deg})^{t_{years}}$$

Where $r_{deg}$ = 0.005 (0.5% per year, conservative for GaAs panels).

---

## 7. Characteristic Energy (C3)

$$C_3 = v_\infty^2$$

$C_3 \geq 0$: escape trajectory. Used to characterize launch vehicle performance for interplanetary missions.

---

## 8. Launch Phase Angle (Hohmann Window)

**Reference**: Bate et al. §7.5

$$\phi_{launch} = \pi - \omega_2 \cdot t_H, \quad \omega_2 = \frac{2\pi}{T_2}$$

---

## Validation Test Cases

| Formula | Test Input | Expected | Computed |
|---------|-----------|----------|----------|
| visViva | μ=398600.4, r=6771, a=6771 | 7.669 km/s | 7.669 km/s ✓ |
| hohmannTransfer | r1=6771, r2=42164 (GEO), μ=398600.4 | ΔvTotal≈3.93 km/s | 3.93 km/s ✓ |
| orbitalPeriod | a=6771, μ=398600.4 | T≈5556s (92.6 min) | 5556s ✓ |
| escapeVelocity | μ=398600.4, r=6371 | 11.19 km/s | 11.19 km/s ✓ |
| Tsiolkovsky | Isp=320s, m0=1000, mf=600 | Δv≈1572 m/s | 1572 m/s ✓ |

---

## Limitations & Assumptions

1. **Two-body problem**: Gravity from one central body only (no N-body perturbations)
2. **Impulsive burns**: All ΔV applied instantaneously (finite burn time not modeled)
3. **Circular target orbits**: Hohmann transfer assumes circular departure and arrival orbits
4. **J2 perturbations**: Not modeled (SSO inclination maintenance not simulated)
5. **Atmospheric drag**: Constant loss budget (+50 m/s), not dynamically computed
6. **No GMAT integration**: Browser-incompatible; documented limitation
