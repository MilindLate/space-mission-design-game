# Data Sources

All external data used in this project. No data has been fabricated.

---

## NASA / JPL APIs

| Source | URL | Data Used | License | Usage in Project |
|--------|-----|-----------|---------|-----------------|
| JPL Horizons API | https://ssd.jpl.nasa.gov/api/horizons.api | Heliocentric planet positions (AU), velocity vectors, Julian dates | Public domain (NASA) | `src/app/api/horizons/route.ts`, `src/lib/api/horizons.ts` |
| JPL Small-Body Database | https://ssd-api.jpl.nasa.gov/sbdb.api | Asteroid orbital elements | Public domain (NASA) | Referenced; future extension |
| NASA NTRS | https://ntrs.nasa.gov/ | Engineering references for propulsion, power, comms | Public domain | Cited in SCIENTIFIC_MODEL.md |
| NASA NSSDC | https://nssdc.gsfc.nasa.gov/ | Planetary fact sheets: semiMajorAxis, eccentricity, inclination | Public domain | `src/lib/data/destinations.ts` |

---

## Orbital Destination Parameters

Source: NASA NSSDC Planetary Fact Sheets (nssdc.gsfc.nasa.gov/planetary/factsheet/)

| Destination | SMA (km) | Eccentricity | Inclination | ΔV from LEO (m/s) | Solar Irradiance (W/m²) | DSN Contact (hr/day) |
|-------------|----------|-------------|-------------|-------------------|------------------------|---------------------|
| LEO | 6771 | 0 | 51.6° | 0 | 1361 | 24 |
| SSO | 6878 | 0.001 | 97.8° | 150 | 1361 | 24 |
| GTO | 24505 | 0.731 | 27° | 2440 | 950 | 20 |
| Lunar Orbit | 1837 | 0.01 | 90° | 3900 | 1361 | 8 |
| Sun–Earth L2 | 1.5×10⁶ | ~0 | 0° | 3400 | 1361 | 16 |
| Mars Transfer | 1.524 AU | 0.093 | 1.85° | 5700 | 589 | 6 |

---

## Spacecraft Component Heritage

Source: NASA mission press kits, JPL spacecraft design documentation, ESA component databases.

| Component | Source Reference | Mass Source |
|-----------|-----------------|------------|
| Small Satellite Bus (3U–16U) | NASA CubeSat Design Specification Rev 14 | Measured |
| Medium Bus (500 kg class) | Orbital Sciences LEOStar-2 heritage | Datasheet |
| Large Bus (2000 kg class) | JPL MRO spacecraft bus specs | Press kit |
| Rigid Solar Array | Spectrolab UTJ GaAs, 28.3% efficiency | Measured |
| Flexible Solar Array | NASA Solar Electric Propulsion development | NTRS |
| RTG (Multi-Mission) | NASA MMRTG: 110W at BOL | Press kit |
| Li-Ion Battery | EaglePicher Li-CFx cells, heritage: MRO | Datasheet |
| Monopropellant (Hydrazine) | Aerojet MR-103, Isp=220s | Datasheet |
| Bipropellant Main Engine | Aerojet R-4D, Isp=311s | Datasheet |
| Hall Effect Thruster | NASA NEXT, Isp=4190s | NTRS-20100016960 |
| S-Band Transponder | NASA standard S-band, 5 W TX | NTRS |
| X-Band HGA | Deep Space Network compatible | JPL DSN docs |
| Ka-Band HGA | KSAT Norway, 300 Mbps | Datasheet |
| Wide Angle Camera | ECAM-C50, heritage Lunar flashlight | Datasheet |
| Hyperspectral Imager | JPL CRISM heritage | NTRS |
| Magnetometer | Fluxgate, Cassini MAG heritage | Press kit |

---

## Real Mission Comparison Data

Source: NASA mission pages (nasa.gov/missions), NASA/JPL press kits.

| Mission | Source URL | Data Used |
|---------|-----------|-----------|
| MRO | nasa.gov/mro | mass=2180 kg, power=1000 W, cost=$716M, 6 instruments |
| Curiosity/MSL | nasa.gov/msl | mass=3839 kg, power=110 W (RTG), cost=$2.5B, 10 instruments |
| JWST | nasa.gov/jwst | mass=6500 kg, power=2000 W, cost=$10B, 4 instruments |
| Cassini | nasa.gov/cassini | mass=5712 kg, power=628 W (RTG), cost=$3.27B, 18 instruments |

---

## Launch Vehicle Data

Source: Manufacturer payload user guides and NASA Launch Services Program.

| Vehicle | Source | Payload to LEO | Payload to GTO |
|---------|--------|---------------|---------------|
| Rocket Lab Electron | Payload User Guide v7 | 300 kg | — |
| SpaceX Falcon 9 | Payload User Guide v2.0 | 22,800 kg | 8,300 kg |
| SpaceX Falcon Heavy | Payload User Guide | 63,800 kg | 26,700 kg |
| ULA Vulcan Centaur | Payload Planner's Guide | 27,200 kg | 15,000 kg |
| NASA SLS Block 1 | NASA SLS Mission Planner's Guide | 95,000 kg | — |
| Blue Origin New Glenn | Payload User Guide | 45,000 kg | 13,000 kg |

---

## Book References (Scientific Formulas)

| Reference | Used For |
|-----------|---------|
| Bate, Mueller & White. *Fundamentals of Astrodynamics*. Dover, 1971. | Keplerian propagator, vis-viva, eccentric anomaly |
| Curtis, Howard. *Orbital Mechanics for Engineering Students*. 3rd ed. Butterworth-Heinemann, 2013. | Hohmann transfer, orbit maneuvers |
| Vallado, David. *Fundamentals of Astrodynamics and Applications*. 4th ed. Microcosm, 2013. | Synodic period, launch windows |
| Wertz, James & Larson, Wiley. *Space Mission Analysis and Design*. 3rd ed. Microcosm, 1999. | Power budget, link budget, mission design |
| Friis, H.T. (1946). "A Note on a Simple Transmission Formula." *Proc. IRE* 34(5):254–256. | Link budget (Friis equation) |
