import { IconButton, Tooltip } from "@mui/material";
import { Icon } from "@iconify/react";

interface Props {
  tooltip: string;
  icon: string;
  onClick?: () => void;
  disabled?: boolean;
  iconHeight?: number;
}

export const ToolbarButton = ({
  tooltip,
  icon,
  onClick,
  disabled = false,
  iconHeight = 24,
}: Props) => {
  const paddingX = `${Math.round(20 - (iconHeight - 24) / 2)}px`;

  return (
    <Tooltip title={tooltip}>
      <span
        style={{
          height: "stretch",
        }}
      >
        <IconButton
          onClick={onClick}
          disabled={disabled}
          sx={{
            paddingX,
            height: "stretch",
            borderRadius: "8px",
            width: "auto",
          }}
        >
          <Icon icon={icon} height={iconHeight} />
        </IconButton>
      </span>
    </Tooltip>
  );
};
