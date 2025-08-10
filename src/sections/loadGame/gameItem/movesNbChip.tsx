import { Icon } from "@iconify/react";
import { Chip, Tooltip } from "@mui/material";

interface Props {
  movesNb?: number;
}

export default function MovesNbChip({ movesNb }: Props) {
  if (!movesNb) return null;

  return (
    <Tooltip title="Number of Moves" sx={{ overflow: "hidden" }}>
      <Chip
        icon={<Icon icon="heroicons:hashtag-20-solid" />}
        label={`${Math.ceil(movesNb / 2)} moves`}
        size="small"
      />
    </Tooltip>
  );
}
