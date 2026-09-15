import React, { useState, useEffect, useRef } from "react";

import {
  MapPin,
  Thermometer,
  Sun,
  Wind,
  Droplets,
  Ruler,
  Compass,
  Layers,
  Home,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lightbulb,
  RotateCcw,
  CheckCircle2,
  TriangleAlert,
  Gauge,
  Zap,
  ChevronRight,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";


/* ------------------------------------------------------------------ */
/*  API                                                                 */
/* ------------------------------------------------------------------ */

const API_BASE = "http://127.0.0.1:8000";


async function fetchClimate(location) {
  const response = await fetch(
    `${API_BASE}/api/climate?location=${encodeURIComponent(location)}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Unable to fetch climate data"
    );
  }

  return response.json();
}


async function generateShelterDesign(
  location,
  buildingType,
  sizeCategory
) {
  const response = await fetch(
    `${API_BASE}/api/generate-design`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location,
        building_type: buildingType,
        size_category: sizeCategory,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail ||
        "Unable to generate shelter design"
    );
  }

  return response.json();
}


/* ------------------------------------------------------------------ */
/*  Design tokens                                                       */
/* ------------------------------------------------------------------ */

const T = {
  navy950: "#0A131A",
  navy900: "#0F1D25",
  navy800: "#16262F",
  line800: "#22343F",

  ice300: "#A9E8F0",
  ice400: "#5FC7D6",
  ice500: "#3AA9BA",

  amber500: "#E7A23A",
  amber600: "#C9852220",

  bgApp: "#EFF3F4",
  surface: "#FFFFFF",
  surfaceAlt: "#E7EDEE",

  text900: "#122029",
  text600: "#54666F",
  text400: "#8DA0A8",

  good: "#4C9A6A",
  warn: "#D98B2B",
};


const STEPS = [
  {
    id: 1,
    label: "Location",
    icon: MapPin,
  },
  {
    id: 2,
    label: "Climate",
    icon: Thermometer,
  },
  {
    id: 3,
    label: "Shelter Design",
    icon: Ruler,
  },
  {
    id: 4,
    label: "Simulation",
    icon: Gauge,
  },
  {
    id: 5,
    label: "Recommendation",
    icon: Lightbulb,
  },
];


const LOCATIONS = [
  "Ladakh",
  "Manali",
  "Srinagar",
  "Spiti Valley",
  "Bangalore",
  "Delhi",
  "Mumbai",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
];


/* ------------------------------------------------------------------ */
/*  Small building blocks                                               */
/* ------------------------------------------------------------------ */

function MountainMark({ opacity = 1 }) {
  return (
    <svg
      width="100%"
      height="52"
      viewBox="0 0 220 52"
      fill="none"
      style={{ opacity }}
    >
      <path
        d="M0 50 L38 14 L62 34 L92 6 L128 40 L150 22 L178 46 L220 12 L220 52 L0 52 Z"
        fill={T.line800}
      />

      <path
        d="M38 14 L48 26 L30 26 Z"
        fill={T.ice400}
        opacity="0.35"
      />

      <path
        d="M92 6 L104 22 L82 22 Z"
        fill={T.ice400}
        opacity="0.35"
      />
    </svg>
  );
}


function FieldLabel({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 12.5,
        fontWeight: 600,
        color: T.text600,
        marginBottom: 7,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </label>
  );
}


const inputBase = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 10,
  border: `1.5px solid ${T.surfaceAlt}`,
  background: T.surface,
  fontSize: 14.5,
  color: T.text900,
  fontFamily: "'IBM Plex Mono', monospace",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .15s",
};


function SelectField({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon
            size={16}
            color={T.text400}
            style={{
              position: "absolute",
              left: 13,
              top: 13,
            }}
          />
        )}

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...inputBase,
            fontFamily: "'Inter', sans-serif",
            appearance: "none",
            paddingLeft: Icon ? 38 : 13,
            cursor: "pointer",
          }}
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronRight
          size={15}
          color={T.text400}
          style={{
            position: "absolute",
            right: 13,
            top: 13,
            transform: "rotate(90deg)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}


function Card({ children, style }) {
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: 16,
        border: `1px solid ${T.surfaceAlt}`,
        padding: 22,
        ...style,
      }}
    >
      {children}
    </div>
  );
}


function PrimaryButton({
  children,
  onClick,
  disabled,
  icon: Icon = ArrowRight,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: disabled
          ? T.text400
          : T.navy900,
        color: "#fff",
        border: "none",
        borderRadius: 11,
        padding: "12px 22px",
        fontSize: 14.5,
        fontWeight: 600,
        cursor: disabled
          ? "not-allowed"
          : "pointer",
        fontFamily: "'Inter', sans-serif",
        transition: "background .15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background =
            T.ice500;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background =
            T.navy900;
        }
      }}
    >
      {children}
      <Icon size={16} />
    </button>
  );
}


function GhostButton({
  children,
  onClick,
  icon: Icon = ArrowLeft,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "transparent",
        color: T.text600,
        border: `1.5px solid ${T.surfaceAlt}`,
        borderRadius: 11,
        padding: "12px 20px",
        fontSize: 14.5,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}


function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  accent,
}) {
  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 128,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: accent + "1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={19} color={accent} />
      </div>

      <div>
        <div
          style={{
            fontSize: 12.5,
            color: T.text600,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: T.text900,
            fontFamily:
              "'IBM Plex Mono', monospace",
          }}
        >
          {value}

          <span
            style={{
              fontSize: 15,
              color: T.text400,
              marginLeft: 4,
            }}
          >
            {unit}
          </span>
        </div>
      </div>
    </Card>
  );
}


function ResultTile({
  label,
  value,
  unit,
}) {
  return (
    <div
      style={{
        background: T.surfaceAlt,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: T.text600,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 19,
          fontWeight: 700,
          color: T.text900,
          fontFamily:
            "'IBM Plex Mono', monospace",
        }}
      >
        {value}

        {unit && (
          <span
            style={{
              fontSize: 12.5,
              color: T.text400,
              fontWeight: 500,
              marginLeft: 4,
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Sidebar                                                             */
/* ------------------------------------------------------------------ */

function Sidebar({
  step,
  maxStep,
  onNavigate,
}) {
  return (
    <div
      style={{
        width: 264,
        minWidth: 264,
        background: T.navy950,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "28px 20px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
          padding: "0 4px",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: T.ice400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Home
            size={17}
            color={T.navy950}
          />
        </div>

        <div>
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 15.5,
              lineHeight: 1.15,
            }}
          >
            Smart Shelter AI
          </div>

          <div
            style={{
              color: T.text400,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            Climate Engineering Simulator
          </div>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: T.line800,
          margin: "24px 4px 20px",
        }}
      />

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flex: 1,
        }}
      >
        {STEPS.map((s) => {
          const isActive = s.id === step;
          const isDone = s.id < maxStep;
          const isReachable = s.id <= maxStep;

          const Icon = s.icon;

          return (
            <button
              key={s.id}
              disabled={!isReachable}
              onClick={() =>
                isReachable &&
                onNavigate(s.id)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: isActive
                  ? T.navy800
                  : "transparent",
                border: "none",
                borderRadius: 11,
                padding: "11px 12px",
                cursor: isReachable
                  ? "pointer"
                  : "default",
                textAlign: "left",
                borderLeft: isActive
                  ? `3px solid ${T.ice400}`
                  : "3px solid transparent",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  flexShrink: 0,
                  background: isActive
                    ? T.ice400
                    : isDone
                      ? T.line800
                      : "transparent",
                  border:
                    !isActive && !isDone
                      ? `1.5px solid ${T.line800}`
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isDone && !isActive ? (
                  <CheckCircle2
                    size={14}
                    color={T.ice300}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      fontFamily:
                        "'IBM Plex Mono', monospace",
                      color: isActive
                        ? T.navy950
                        : T.text400,
                    }}
                  >
                    {s.id}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: isActive
                    ? 600
                    : 500,
                  color: isActive
                    ? "#fff"
                    : isReachable
                      ? T.text400
                      : "#3E4E58",
                }}
              >
                {s.label}
              </span>

              <Icon
                size={14}
                color={
                  isActive
                    ? T.ice300
                    : "transparent"
                }
                style={{
                  marginLeft: "auto",
                }}
              />
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto" }}>
        <MountainMark opacity={0.9} />

        <div
          style={{
            height: 1,
            background: T.line800,
            margin: "16px 4px",
          }}
        />

        <div
          style={{
            color: T.text400,
            fontSize: 10.5,
            padding: "0 4px",
            lineHeight: 1.5,
          }}
        >
          B.Tech Engineering Project
          <br />
          AI-Assisted Shelter Design
          for Extreme Climates
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Screen shell                                                        */
/* ------------------------------------------------------------------ */

function ScreenShell({
  eyebrow,
  title,
  subtitle,
  children,
}) {
  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "44px 40px 60px",
      }}
    >
      <div style={{ marginBottom: 30 }}>
        <div
          style={{
            color: T.ice500,
            fontSize: 12.5,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>

        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: T.text900,
            margin: "0 0 8px",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontSize: 15,
              color: T.text600,
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Screen 1 — Location                                                 */
/* ------------------------------------------------------------------ */

function LocationScreen({
  location,
  setLocation,
  onNext,
}) {
  return (
    <ScreenShell
      eyebrow="STEP 1 OF 5"
      title="Location"
      subtitle="Select the location for shelter simulation."
    >
      <Card style={{ maxWidth: 460 }}>
        <SelectField
          label="Site location"
          value={location}
          options={LOCATIONS}
          onChange={setLocation}
          icon={MapPin}
        />

        <p
          style={{
            fontSize: 13,
            color: T.text400,
            marginTop: 14,
            lineHeight: 1.5,
          }}
        >
          Climate data for the selected site —
          temperature, solar radiation, wind speed
          and humidity — will be loaded
          automatically in the next step.
        </p>
      </Card>

      <div style={{ marginTop: 28 }}>
        <PrimaryButton onClick={onNext}>
          Continue
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}


/* ------------------------------------------------------------------ */
/*  Screen 2 — Climate                                                  */
/* ------------------------------------------------------------------ */

function ClimateScreen({
  location,
  climate,
  loading,
  error,
  onBack,
  onNext,
}) {
  return (
    <ScreenShell
      eyebrow="STEP 2 OF 5"
      title="Climate Conditions"
      subtitle={`Site conditions recorded for ${location}.`}
    >
      {loading ? (
        <Card
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            padding: 40,
          }}
        >
          <Loader2
            size={30}
            color={T.ice500}
            className="spin"
          />

          <div
            style={{
              fontSize: 14,
              color: T.text600,
              fontWeight: 600,
            }}
          >
            Loading live climate data...
          </div>
        </Card>
      ) : error ? (
        <Card
          style={{
            borderColor: "#D98B2B55",
            background: "#FFF9F0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: T.warn,
              fontWeight: 600,
            }}
          >
            <TriangleAlert size={19} />
            Unable to load climate data
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: T.text600,
            }}
          >
            {error}
          </div>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 16,
          }}
        >
          <MetricCard
            icon={Thermometer}
            label="Temperature"
            value={climate.temp}
            unit="°C"
            accent={T.ice500}
          />

          <MetricCard
            icon={Sun}
            label="Solar Radiation"
            value={climate.solar}
            unit="W/m²"
            accent={T.amber500}
          />

          <MetricCard
            icon={Wind}
            label="Wind Speed"
            value={climate.wind}
            unit="m/s"
            accent={T.text600}
          />

          <MetricCard
            icon={Droplets}
            label="Humidity"
            value={climate.humidity}
            unit="%"
            accent="#4C8FBF"
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 30,
        }}
      >
        <GhostButton onClick={onBack}>
          Back
        </GhostButton>

        <PrimaryButton
          onClick={onNext}
          disabled={loading || !!error}
        >
          Continue
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}


/* ------------------------------------------------------------------ */
/*  Screen 3 — Shelter Requirements                                     */
/* ------------------------------------------------------------------ */

function ShelterScreen({
  buildingType,
  setBuildingType,
  sizeCategory,
  setSizeCategory,
  onBack,
  onRun,
  generating,
}) {
  return (
    <ScreenShell
      eyebrow="STEP 3 OF 5"
      title="Shelter Requirements"
      subtitle="Tell the system what type and scale of shelter you need. The AI will determine the technical design."
    >
      <Card>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: T.text600,
            marginBottom: 16,
          }}
        >
          BUILDING TYPE
        </div>

        <SelectField
          label="Shelter Type"
          value={buildingType}
          options={[
            "Residential",
            "Educational",
            "Commercial",
          ]}
          onChange={setBuildingType}
          icon={Home}
        />

        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: T.text600,
            marginTop: 28,
            marginBottom: 16,
          }}
        >
          SIZE
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {[
            "Small",
            "Medium",
            "Large",
          ].map((size) => {
            const selected =
              sizeCategory === size;

            return (
              <button
                key={size}
                onClick={() =>
                  setSizeCategory(size)
                }
                style={{
                  padding: "18px 14px",
                  borderRadius: 12,
                  border: selected
                    ? `2px solid ${T.ice500}`
                    : `1.5px solid ${T.surfaceAlt}`,
                  background: selected
                    ? `${T.ice500}12`
                    : T.surface,
                  color: T.text900,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: selected
                    ? 700
                    : 600,
                  fontFamily:
                    "'Inter', sans-serif",
                }}
              >
                {size}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 14,
            borderRadius: 10,
            background: T.surfaceAlt,
            fontSize: 13,
            color: T.text600,
            lineHeight: 1.5,
          }}
        >
          The selected size is a design
          requirement. The AI will determine
          the actual floor area, dimensions,
          materials, insulation and orientation
          based on the location and building type.
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 28,
        }}
      >
        <GhostButton onClick={onBack}>
          Back
        </GhostButton>

        <PrimaryButton
          onClick={onRun}
          disabled={generating}
          icon={
            generating
              ? Loader2
              : ArrowRight
          }
        >
          {generating
            ? "Generating Design..."
            : "Generate Shelter Design"}
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}


/* ------------------------------------------------------------------ */
/*  Generated Design Summary                                            */
/* ------------------------------------------------------------------ */

function GeneratedDesignCard({
  design,
}) {
  if (!design) {
    return null;
  }

  return (
    <Card
      style={{
        marginBottom: 20,
        borderColor: `${T.ice500}55`,
        background: `linear-gradient(180deg, ${T.ice500}0D, ${T.surface})`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `${T.ice500}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle2
            size={18}
            color={T.ice500}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 15.5,
              fontWeight: 700,
              color: T.text900,
            }}
          >
            AI-Generated Shelter Design
          </div>

          <div
            style={{
              fontSize: 12,
              color: T.text600,
              marginTop: 2,
            }}
          >
            Optimized from the selected climate,
            building type and size category.
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <ResultTile
          label="Floor Area"
          value={design.floor_area}
          unit="m²"
        />

        <ResultTile
          label="Length"
          value={design.length}
          unit="m"
        />

        <ResultTile
          label="Width"
          value={design.width}
          unit="m"
        />

        <ResultTile
          label="Height"
          value={design.height}
          unit="m"
        />

        <ResultTile
          label="Wall"
          value={design.wall}
        />

        <ResultTile
          label="Roof"
          value={design.roof}
        />

        <ResultTile
          label="Insulation"
          value={design.insulation}
          unit="mm"
        />

        <ResultTile
          label="Orientation"
          value={design.orientation}
        />
      </div>
    </Card>
  );
}


/* ------------------------------------------------------------------ */
/*  Screen 4 — Simulation                                               */
/* ------------------------------------------------------------------ */

function SimulationScreen({
  location,
  buildingType,
  sizeCategory,
  climate,
  design,
  sim,
  progress,
  done,
  error,
  onBack,
  onNext,
}) {
  const score =
    sim?.thermal_score ?? 0;

  const gaugeData = [
    {
      name: "score",
      value: score,
      fill: T.ice400,
    },
  ];

  return (
    <ScreenShell
      eyebrow="STEP 4 OF 5"
      title="Simulation"
      subtitle={`Running thermal and energy simulation for ${location}.`}
    >
      {design && (
        <GeneratedDesignCard
          design={design}
        />
      )}

      <Card
        style={{
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 28px",
            fontSize: 13,
          }}
        >
          <span style={{ color: T.text600 }}>
            Site:{" "}
            <b style={{ color: T.text900 }}>
              {location}
            </b>
          </span>

          <span style={{ color: T.text600 }}>
            Building:{" "}
            <b style={{ color: T.text900 }}>
              {buildingType}
            </b>
          </span>

          <span style={{ color: T.text600 }}>
            Size:{" "}
            <b style={{ color: T.text900 }}>
              {sizeCategory}
            </b>
          </span>

          {design && (
            <>
              <span
                style={{
                  color: T.text600,
                }}
              >
                Area:{" "}
                <b
                  style={{
                    color: T.text900,
                  }}
                >
                  {design.floor_area} m²
                </b>
              </span>

              <span
                style={{
                  color: T.text600,
                }}
              >
                Dimensions:{" "}
                <b
                  style={{
                    color: T.text900,
                  }}
                >
                  {design.length} ×{" "}
                  {design.width} ×{" "}
                  {design.height} m
                </b>
              </span>
            </>
          )}

          <span
            style={{
              color: T.text600,
            }}
          >
            Outdoor Temp:{" "}
            <b
              style={{
                color: T.text900,
              }}
            >
              {climate.temp}°C
            </b>
          </span>
        </div>
      </Card>

      {error ? (
        <Card
          style={{
            borderColor: "#D98B2B55",
            background: "#FFF9F0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: T.warn,
              fontWeight: 600,
            }}
          >
            <TriangleAlert size={19} />
            Simulation failed
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              color: T.text600,
            }}
          >
            {error}
          </div>
        </Card>
      ) : !done || !sim ? (
        <Card
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: 40,
          }}
        >
          <Loader2
            size={30}
            color={T.ice500}
            className="spin"
          />

          <div
            style={{
              fontSize: 14,
              color: T.text600,
              fontWeight: 600,
            }}
          >
            Running climate &amp; thermal
            simulation…
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 360,
              height: 8,
              background: T.surfaceAlt,
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: T.ice400,
                transition:
                  "width .2s linear",
              }}
            />
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: T.text400,
              fontFamily:
                "'IBM Plex Mono', monospace",
            }}
          >
            {progress}%
          </div>
        </Card>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(160px,1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <ResultTile
              label="Floor Area"
              value={sim.floor_area.toFixed(1)}
              unit="m²"
            />

            <ResultTile
              label="Shelter Volume"
              value={sim.volume.toFixed(1)}
              unit="m³"
            />

            <ResultTile
              label="Heat Loss"
              value={sim.heat_loss_kw.toFixed(2)}
              unit="kW"
            />

            <ResultTile
              label="Daily Energy Req."
              value={sim.daily_energy_kwh.toFixed(1)}
              unit="kWh/day"
            />

            <ResultTile
              label="Solar Gain"
              value={sim.solar_gain_w.toFixed(0)}
              unit="W"
            />

            <ResultTile
              label="Thermal Performance"
              value={sim.thermal_score.toFixed(0)}
              unit="/ 100"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.4fr 1fr",
              gap: 16,
            }}
          >
            <Card>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: T.text600,
                  marginBottom: 10,
                }}
              >
                HEAT LOSS BY COMPONENT (kW)
              </div>

              <ResponsiveContainer
                width="100%"
                height={190}
              >
                <BarChart
                  data={sim.breakdown}
                  barSize={44}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={T.surfaceAlt}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                      fill: T.text600,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: T.text400,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: T.surfaceAlt,
                    }}
                    contentStyle={{
                      borderRadius: 10,
                      border: `1px solid ${T.surfaceAlt}`,
                      fontSize: 12.5,
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill={T.ice400}
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: T.text600,
                  marginBottom: 6,
                  alignSelf: "flex-start",
                }}
              >
                THERMAL PERFORMANCE
              </div>

              <ResponsiveContainer
                width="100%"
                height={170}
              >
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={gaugeData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />

                  <RadialBar
                    background={{
                      fill: T.surfaceAlt,
                    }}
                    dataKey="value"
                    cornerRadius={8}
                  />
                </RadialBarChart>
              </ResponsiveContainer>

              <div
                style={{
                  marginTop: -110,
                  fontSize: 26,
                  fontWeight: 700,
                  color: T.text900,
                  fontFamily:
                    "'IBM Plex Mono', monospace",
                }}
              >
                {score.toFixed(0)}
              </div>

              <div
                style={{
                  marginTop: 68,
                  fontSize: 12,
                  color: T.text400,
                  fontWeight: 600,
                }}
              >
                out of 100
              </div>
            </Card>
          </div>
        </>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 28,
        }}
      >
        <GhostButton onClick={onBack}>
          Back
        </GhostButton>

        <PrimaryButton
          onClick={onNext}
          disabled={
            !done ||
            !!error ||
            !sim
          }
        >
          View Recommendation
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}


/* ------------------------------------------------------------------ */
/*  Screen 5 — Recommendation                                           */
/* ------------------------------------------------------------------ */

function RecommendationScreen({
  design,
  buildingType,
  sizeCategory,
  onRestart,
}) {
  if (!design) {
    return null;
  }

  const performance =
    design.thermal_score >= 80
      ? "High"
      : design.thermal_score >= 60
        ? "Medium"
        : "Low";

  const comfort =
    design.thermal_score >= 80
      ? "Excellent"
      : design.thermal_score >= 60
        ? "Good"
        : "Fair";

  const rows = [
    {
      label: "Optimized Area",
      value: `${design.floor_area} m²`,
      icon: Ruler,
    },
    {
      label: "Generated Dimensions",
      value: `${design.length} × ${design.width} × ${design.height} m`,
      icon: Ruler,
    },
    {
      label: "Recommended Orientation",
      value: design.orientation,
      icon: Compass,
    },
    {
      label: "Recommended Wall",
      value: design.wall,
      icon: Layers,
    },
    {
      label: "Recommended Roof",
      value: design.roof,
      icon: Home,
    },
    {
      label: "Recommended Insulation",
      value: `${design.insulation} mm`,
      icon: Ruler,
    },
  ];

  return (
    <ScreenShell
      eyebrow="STEP 5 OF 5"
      title="Optimized Shelter Design"
      subtitle="AI-generated design selected from the available engineering design space."
    >
      <Card
        style={{
          borderColor:
            T.amber500 + "55",
          background: `linear-gradient(180deg, ${T.amber500}0D, ${T.surface})`,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background:
                T.amber500 + "22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lightbulb
              size={17}
              color={T.amber500}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: 15.5,
                fontWeight: 700,
                color: T.text900,
              }}
            >
              Engineering Recommendation
            </div>

            <div
              style={{
                fontSize: 12,
                color: T.text600,
                marginTop: 2,
              }}
            >
              {buildingType} · {sizeCategory}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px,1fr))",
            gap: 14,
          }}
        >
          {rows.map((row) => {
            const Icon = row.icon;

            return (
              <div
                key={row.label}
                style={{
                  background: T.surface,
                  borderRadius: 12,
                  padding: 16,
                  border: `1px solid ${T.surfaceAlt}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Icon
                    size={15}
                    color={T.ice500}
                  />

                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: T.text600,
                    }}
                  >
                    {row.label}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 16.5,
                    fontWeight: 700,
                    color: T.text900,
                  }}
                >
                  {row.value}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px,1fr))",
          gap: 16,
        }}
      >
        <Card style={{ textAlign: "center" }}>
          <Gauge
            size={22}
            color={T.ice500}
            style={{ marginBottom: 8 }}
          />

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: T.text900,
              fontFamily:
                "'IBM Plex Mono', monospace",
            }}
          >
            {design.thermal_score}
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: T.text600,
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            Thermal Performance / 100
          </div>
        </Card>

        <Card style={{ textAlign: "center" }}>
          <Zap
            size={22}
            color={T.amber500}
            style={{ marginBottom: 8 }}
          />

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: T.text900,
            }}
          >
            {performance}
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: T.text600,
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            Energy Efficiency
          </div>
        </Card>

        <Card style={{ textAlign: "center" }}>
          <Thermometer
            size={22}
            color={T.ice500}
            style={{ marginBottom: 8 }}
          />

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: T.text900,
            }}
          >
            {comfort}
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: T.text600,
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            Thermal Comfort
          </div>
        </Card>
      </div>

      <Card
        style={{
          marginTop: 20,
          background: T.surfaceAlt,
          border: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <CheckCircle2
            size={20}
            color={T.good}
            style={{
              flexShrink: 0,
              marginTop: 1,
            }}
          />

          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: T.text900,
                marginBottom: 5,
              }}
            >
              Design selected successfully
            </div>

            <div
              style={{
                fontSize: 13,
                color: T.text600,
                lineHeight: 1.55,
              }}
            >
              The system searched candidate
              building dimensions, envelope
              materials, insulation levels and
              orientations within the selected
              design constraints and selected the
              configuration with the lowest
              calculated heat loss.
            </div>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 30 }}>
        <PrimaryButton
          onClick={onRestart}
          icon={RotateCcw}
        >
          Start New Simulation
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}


/* ------------------------------------------------------------------ */
/*  App                                                                 */
/* ------------------------------------------------------------------ */

export default function SmartShelterAI() {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);

  const [location, setLocation] =
    useState("Ladakh");

  const [buildingType, setBuildingType] =
    useState("Residential");

  const [sizeCategory, setSizeCategory] =
    useState("Medium");

  const [climate, setClimate] =
    useState(null);

  const [climateLoading, setClimateLoading] =
    useState(false);

  const [climateError, setClimateError] =
    useState("");

  const [design, setDesign] =
    useState(null);

  const [recommendations, setRecommendations] =
    useState([]);

  const [simulation, setSimulation] =
    useState(null);

  const [progress, setProgress] =
    useState(0);

  const [simDone, setSimDone] =
    useState(false);

  const [simulationError, setSimulationError] =
    useState("");

  const [generating, setGenerating] =
    useState(false);

  const timerRef = useRef(null);


  /* --------------------------------------------------------------- */
  /*  Load live climate whenever location changes                    */
  /* --------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadClimate() {
      setClimateLoading(true);
      setClimateError("");

      try {
        const data =
          await fetchClimate(location);

        if (!cancelled) {
          setClimate(data);
        }
      } catch (error) {
        if (!cancelled) {
          setClimateError(error.message);
          setClimate(null);
        }
      } finally {
        if (!cancelled) {
          setClimateLoading(false);
        }
      }
    }

    loadClimate();

    return () => {
      cancelled = true;
    };
  }, [location]);


  /* --------------------------------------------------------------- */
  /*  Navigation                                                       */
  /* --------------------------------------------------------------- */

  const goTo = (number) => {
    setStep(number);
  };


  const advance = (number) => {
    setStep(number);

    setMaxStep((current) =>
      Math.max(current, number)
    );
  };


  /* --------------------------------------------------------------- */
  /*  Generate AI shelter design                                      */
  /* --------------------------------------------------------------- */

  const runSimulation = async () => {
    if (!climate) {
      setSimulationError(
        "Climate data is not available yet."
      );

      return;
    }

    setGenerating(true);
    setSimulationError("");
    setSimDone(false);
    setProgress(0);
    setDesign(null);
    setSimulation(null);
    setRecommendations([]);

    advance(4);

    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) {
          clearInterval(
            timerRef.current
          );

          return 90;
        }

        return Math.min(
          90,
          current +
            Math.round(
              8 + Math.random() * 12
            )
        );
      });
    }, 160);

    try {
      const result =
        await generateShelterDesign(
          location,
          buildingType,
          sizeCategory
        );

      clearInterval(timerRef.current);

      setDesign(result.design);
      setSimulation(result.design);
      setRecommendations(
        result.recommendations || []
      );

      setProgress(100);
      setSimDone(true);
    } catch (error) {
      clearInterval(timerRef.current);

      setSimulationError(
        error.message
      );

      setSimDone(true);
    } finally {
      setGenerating(false);
    }
  };


  /* --------------------------------------------------------------- */
  /*  Cleanup                                                         */
  /* --------------------------------------------------------------- */

  useEffect(() => {
    return () =>
      clearInterval(
        timerRef.current
      );
  }, []);


  /* --------------------------------------------------------------- */
  /*  Restart                                                         */
  /* --------------------------------------------------------------- */

  const restart = () => {
    clearInterval(timerRef.current);

    setStep(1);
    setMaxStep(1);

    setLocation("Ladakh");
    setBuildingType("Residential");
    setSizeCategory("Medium");

    setDesign(null);
    setSimulation(null);
    setRecommendations([]);

    setProgress(0);
    setSimDone(false);
    setSimulationError("");
    setGenerating(false);
  };


  /* --------------------------------------------------------------- */
  /*  Climate format for UI                                           */
  /* --------------------------------------------------------------- */

  const climateForUI = climate
    ? {
        temp: climate.temperature,
        solar: climate.solar_radiation,
        wind: climate.wind_speed,
        humidity: climate.humidity,
      }
    : {
        temp: "--",
        solar: "--",
        wind: "--",
        humidity: "--",
      };


  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        background: T.bgApp,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        select {
          font-family: 'Inter', sans-serif;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-thumb {
          background: #C7D2D5;
          border-radius: 8px;
        }
      `}</style>


      <Sidebar
        step={step}
        maxStep={maxStep}
        onNavigate={goTo}
      />


      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {/* --------------------------------------------------------- */}
        {/* STEP 1                                                    */}
        {/* --------------------------------------------------------- */}

        {step === 1 && (
          <LocationScreen
            location={location}
            setLocation={setLocation}
            onNext={() => advance(2)}
          />
        )}


        {/* --------------------------------------------------------- */}
        {/* STEP 2                                                    */}
        {/* --------------------------------------------------------- */}

        {step === 2 && (
          <ClimateScreen
            location={location}
            climate={climateForUI}
            loading={climateLoading}
            error={climateError}
            onBack={() => goTo(1)}
            onNext={() => advance(3)}
          />
        )}


        {/* --------------------------------------------------------- */}
        {/* STEP 3                                                    */}
        {/* --------------------------------------------------------- */}

        {step === 3 && (
          <ShelterScreen
            buildingType={buildingType}
            setBuildingType={setBuildingType}
            sizeCategory={sizeCategory}
            setSizeCategory={setSizeCategory}
            onBack={() => goTo(2)}
            onRun={runSimulation}
            generating={generating}
          />
        )}


        {/* --------------------------------------------------------- */}
        {/* STEP 4                                                    */}
        {/* --------------------------------------------------------- */}

        {step === 4 && (
          <SimulationScreen
            location={location}
            buildingType={buildingType}
            sizeCategory={sizeCategory}
            climate={climateForUI}
            design={design}
            sim={simulation}
            progress={progress}
            done={simDone}
            error={simulationError}
            onBack={() => goTo(3)}
            onNext={() => advance(5)}
          />
        )}


        {/* --------------------------------------------------------- */}
        {/* STEP 5                                                    */}
        {/* --------------------------------------------------------- */}

        {step === 5 && design && (
          <RecommendationScreen
            design={design}
            buildingType={buildingType}
            sizeCategory={sizeCategory}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}