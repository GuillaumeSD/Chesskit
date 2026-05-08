import { Box, Grid2 as Grid, Grid2Props as GridProps } from "@mui/material";
import { useAtomValue } from "jotai";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DotProps } from "recharts";
import {
  boardAtom,
  currentPositionAtom,
  gameAtom,
  gameEvalAtom,
} from "../../states";
import { useCallback, useMemo } from "react";
import type { ReactElement } from "react";
import CustomTooltip from "./tooltip";
import { ChartItemData } from "./types";
import { PositionEval } from "@/types/eval";
import { CLASSIFICATION_COLORS } from "@/constants";
import CustomDot from "./dot";
import { MoveClassification } from "@/types/enums";
import { useChessActions } from "@/hooks/useChessActions";

export default function GraphTab(props: GridProps) {
  const gameEval = useAtomValue(gameEvalAtom);
  const currentPosition = useAtomValue(currentPositionAtom);
  const { goToMove } = useChessActions(boardAtom);
  const game = useAtomValue(gameAtom);

  const chartData: ChartItemData[] = useMemo(
    () => gameEval?.positions.map(formatEvalToChartData) ?? [],
    [gameEval]
  );

  const bestDotIndices = useMemo(() => {
    const bestItems = chartData.filter(
      (item) => item.moveClassification === MoveClassification.Best
    );
    const count = Math.ceil(bestItems.length * 0.15);
    const indices = bestItems.map((item) => item.moveNb);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return new Set(indices.slice(0, count));
  }, [chartData]);

  const boardMoveColor = currentPosition.eval?.moveClassification
    ? CLASSIFICATION_COLORS[currentPosition.eval.moveClassification]
    : "grey";

  // Render a dot only on selected classifications (always returns an element)
  const renderDot = useCallback(
    (
      props: DotProps & { payload?: ChartItemData }
    ): ReactElement<SVGElement> => {
      const payload = props.payload;
      const moveClass = payload?.moveClassification;
      if (!moveClass) return <svg key={props.key} />;

      if (
        [
          MoveClassification.Brilliant,
          MoveClassification.Great,
          MoveClassification.Mistake,
          MoveClassification.Blunder,
          MoveClassification.Miss,
        ].includes(moveClass) ||
        (moveClass === MoveClassification.Best &&
          bestDotIndices.has(payload.moveNb))
      ) {
        return <CustomDot {...props} key={props.key} payload={payload} />;
      }

      return <svg key={props.key} />;
    },
    [bestDotIndices]
  );

  if (!gameEval) return null;

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      minHeight="min(10rem, 8vh)"
      height={{ xs: "8rem", lg: "none" }}
      maxHeight="10rem"
      {...props}
      sx={props.hidden ? { display: "none" } : props.sx}
      size={12}
    >
      <Box
        height="100%"
        width={{ xs: "100%", lg: "90%" }}
        sx={{
          backgroundColor: "#2e2e2e",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={chartData}
            margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={(e) => {
              const payload = e?.activePayload?.[0]?.payload as
                | ChartItemData
                | undefined;
              if (!payload) return;

              goToMove(payload.moveNb, game);
            }}
            style={{ cursor: "pointer" }}
          >
            <XAxis dataKey="moveNb" hide stroke="red" />
            <YAxis domain={[0, 20]} hide />
            <Tooltip
              content={<CustomTooltip />}
              isAnimationActive={false}
              cursor={{
                stroke: "grey",
                strokeWidth: 2,
                strokeOpacity: 0.3,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              dot={renderDot}
              activeDot={<CustomDot />}
              isAnimationActive={false}
            />
            <ReferenceLine
              y={10}
              stroke="grey"
              strokeWidth={2}
              strokeOpacity={0.4}
            />
            <ReferenceLine
              x={currentPosition.currentMoveIdx}
              stroke={boardMoveColor}
              strokeWidth={4}
              strokeOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Grid>
  );
}

const formatEvalToChartData = (
  position: PositionEval,
  index: number
): ChartItemData => {
  const line = position.lines[0];

  const chartItem: ChartItemData = {
    moveNb: index,
    value: 10,
    cp: line.cp,
    mate: line.mate,
    moveClassification: position.moveClassification,
  };

  if (line.mate) {
    return {
      ...chartItem,
      value: line.mate > 0 ? 20 : 0,
    };
  }

  if (line.cp) {
    return {
      ...chartItem,
      value: Math.max(Math.min(line.cp / 100, 10), -10) + 10,
    };
  }

  return chartItem;
};
