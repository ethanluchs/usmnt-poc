declare module "react-simple-maps" {
  import * as React from "react";

  export interface Geography {
    rsmKey: string;
    id: string | number;
    [key: string]: unknown;
  }

  export interface MoveEndPosition {
    coordinates: [number, number];
    zoom: number;
  }

  export function ComposableMap(props: {
    projection?: string;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }): JSX.Element;

  export function ZoomableGroup(props: {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    filterZoomEvent?: (e: Event) => boolean;
    onMoveStart?: () => void;
    onMoveEnd?: (pos: MoveEndPosition, event: unknown) => void;
    children?: React.ReactNode;
  }): JSX.Element;

  export function Geographies(props: {
    geography: string;
    children: (props: { geographies: Geography[] }) => React.ReactNode;
  }): JSX.Element;

  export function Geography(props: {
    geography: Geography;
    key?: string;
    style?: Record<string, React.CSSProperties>;
    [key: string]: unknown;
  }): JSX.Element;

  export function useMapContext(): {
    projection: (coords: [number, number]) => [number, number] | null;
    path: unknown;
    width: number;
    height: number;
  };
}
