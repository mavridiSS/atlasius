import * as React from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import Table from "../../../components/Table";
import {
  getBackgroundColor,
  getHoverBackgroundColor,
} from "../../../utils/common";
import { ProductResponse } from "../../../types/product";

const renderPackButton =
  (
    onClick: (row: ProductResponse, isPacked: boolean) => void,
    packedProductsIds: string[]
  ) =>
  (params: GridRenderCellParams) => {
    const isPacked = packedProductsIds.includes(params.row.id);
    const handleClick = () => onClick(params.row, !isPacked);
    return (
      <strong>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleClick}
        >
          {isPacked ? "Върни за пакетиране" : "Пакетирай"}
        </Button>
      </strong>
    );
  };

const columns = (
  onPack: (row: ProductResponse, isPacked: boolean) => void,
  packedProductsIds: string[]
): GridColDef[] => [
  { field: "id", type: "number", hide: true, headerName: "ID", width: 90 },
  {
    field: "name",
    headerName: "Име на продукт",
    width: 350,
  },
  {
    field: "sku",
    headerName: "SKU",
    width: 150,
  },
  {
    field: "ean",
    headerName: "Баркод",
    width: 150,
  },
  {
    field: "orderedQuantity",
    headerName: "Бройка",
    width: 150,
  },
  {
    field: "a",
    headerName: "Пакетирай",
    width: 200,
    sortable: false,
    filterable: false,
    renderCell: renderPackButton(onPack, packedProductsIds),
  },
];

interface Props {
  rows: ProductResponse[];
  packedProductsIds: string[];
  onPack: (row: ProductResponse, isPacked: boolean) => void;
}

export const PackingProductsTable = ({
  rows,
  onPack,
  packedProductsIds,
  ...other
}: Props) => {
  return (
    <Box
      sx={{
        "& .row--Packed": {
          bgcolor: (theme) =>
            getBackgroundColor(theme.palette.info.main, theme.palette.mode),
          "&:hover": {
            bgcolor: (theme) =>
              getHoverBackgroundColor(
                theme.palette.info.main,
                theme.palette.mode
              ),
          },
        },
      }}
    >
      <Table
        checkboxSelection={false}
        title={"Продукти за пакетиране"}
        columns={columns(onPack, packedProductsIds)}
        rows={rows}
        getRowClassName={(params) =>
          `row--${
            packedProductsIds.includes(params.row.id) ? "Packed" : "NotPacked"
          }`
        }
        {...other}
      />
    </Box>
  );
};

export default PackingProductsTable;
