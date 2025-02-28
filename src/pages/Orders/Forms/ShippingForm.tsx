import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormContainer,
  TextFieldElement,
  AutocompleteElement,
} from "react-hook-form-mui";
import { Button, FormControlLabel, Grid, Switch } from "@mui/material";
import Econt from "../../../econt";
import { MappedOrder } from "../../../types";
import { Address, Country } from "../../../types/econt";
import useStore from "../../../store/globalStore";
import VirtualizedAutocomplete from "./VirtualizedAutocomplete";
import Alert from "@mui/material/Alert";

import useEcont from "./useEcont";
import { shouldOrderBeDeliveredToOffice } from "../utils";
import { DeliveryCompany } from "../../Companies/types";
import ValidAddress from "./ValidAddress";
import { OrderShippingDetails, updateShippingDetails } from "../api";
import { getDeliveryCompanyCredentials } from "../../../utils/common";

type MappedEcontOrder = MappedOrder<DeliveryCompany.Econt>;

interface Props {
  onSave?: () => void;
  onSubmit?: (data: MappedEcontOrder) => void;
  formContext: UseFormReturn<MappedEcontOrder>;
}

export default function ShippingForm({ formContext, onSave, onSubmit }: Props) {
  const country = formContext.watch("country") as Country;
  const city = formContext.watch("city");
  const office = formContext.watch("office");
  const validAddress = formContext.watch("validatedAddress");
  const company = formContext.getValues("company");
  const credentials = getDeliveryCompanyCredentials(
    company,
    DeliveryCompany.Econt
  );

  const setNotification = useStore((state) => state.setNotification);
  const [deliverToOffice, setDeliverToOffice] = React.useState(
    shouldOrderBeDeliveredToOffice(formContext.getValues())
  );

  const [validatedAddress, setValidatedAddress] =
    React.useState<Address>(validAddress);
  const econtCountries = useStore((state) => state.econtCountries);

  const econtService = React.useRef(new Econt(credentials)).current;
  const {
    offices = [],
    streets = [],
    cities = [],
    isLoadingCities,
    isLoadingOffices,
    isLoadingStreets,
  } = useEcont({
    countryCode: country?.code3,
    cityID: typeof city === "string" ? undefined : city?.id,
    deliverToOffice,
    service: econtService,
  });

  const isLoading = isLoadingCities;

  const updateDetails = async (
    data: MappedEcontOrder,
    validatedEcontAddres = {}
  ) => {
    const { country, id } = data;
    let shippingDetails: OrderShippingDetails = {};
    if (deliverToOffice) {
      shippingDetails = {
        id,
        officeId: office?.code,
        country: (country as Country).name,
      };
    } else {
      shippingDetails = {
        id,
        address1: validatedEcontAddres.fullAddress,
        city: validatedEcontAddres.city.name,
        zipCode: validatedEcontAddres.zip,
        country: validatedEcontAddres.city.country.name,
        streetName: validatedEcontAddres.street,
        streetNumber: validatedEcontAddres.num,
        officeId: undefined,
      };
    }
    const response = await updateShippingDetails(shippingDetails);
    if (response.success) {
      setNotification({ type: "success", message: response.success });
      if (onSave) onSave();
    } else {
      setNotification({ type: "error", message: response.error });
    }
  };

  const saveShippingDetails = async () => {
    const data = formContext.getValues();
    const { streetNumber, street, zipCode, city } = data;
    if (deliverToOffice) return updateDetails(data);

    const { error, address } = await econtService.validateAddress(
      typeof city === "string" ? city : city?.name,
      street?.name,
      streetNumber,
      zipCode
    );

    if (error) {
      setNotification({ type: "error", message: error });
    } else {
      formContext.setValue("address1", address.fullAddress);
      setValidatedAddress(address);
      updateDetails(data, address);
    }
  };

  const handleCheckboxChange = (_, checked: boolean) =>
    setDeliverToOffice(checked);

  return (
    <>
      {!credentials ? (
        <Alert severity="warning">
          Липсват данни за Еконт за компания {company.name}
        </Alert>
      ) : (
        <ValidAddress
          isValid={
            deliverToOffice ? Boolean(office) : Boolean(validatedAddress)
          }
          isLoading={isLoading}
          deliverToOffice={deliverToOffice}
          deliveryCompany={DeliveryCompany.Econt}
        />
      )}

      <FormControlLabel
        control={
          <Switch
            checked={deliverToOffice}
            disabled
            onChange={handleCheckboxChange}
          />
        }
        label="До офис"
      />

      <FormContainer
        formContext={formContext}
        onSuccess={onSubmit}
        FormProps={{
          id: "packing-form",
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            mb: 4,
          }}
        >
          <Grid item xs={6} md={4}>
            <AutocompleteElement
              textFieldProps={{
                variant: "standard",
              }}
              autocompleteProps={{
                fullWidth: true,
                isOptionEqualToValue(option, value) {
                  return option.code2 === value.code2;
                },
                getOptionLabel(option: Country) {
                  return `${option.name}  - ${option.nameEn}`;
                },
              }}
              name="country"
              label="Държава"
              options={econtCountries}
              required
            />
          </Grid>
          {!deliverToOffice && (
            <>
              <Grid item xs={6} md={4}>
                <VirtualizedAutocomplete
                  name="city"
                  label="Град"
                  options={cities}
                  required
                  loading={isLoadingCities}
                  autocompleteProps={{
                    disabled: !country,
                    getOptionLabel(option) {
                      if (typeof option === "string") return "";
                      const { postCode, name, nameEn } = option;
                      return `${postCode} - ${name} - ${nameEn}`;
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextFieldElement
                  variant="standard"
                  name="zipCode"
                  label="Пощенски код"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextFieldElement
                  variant="standard"
                  name="quarter"
                  label="Квартал"
                  fullWidth
                />
              </Grid>
            </>
          )}
          {!deliverToOffice ? (
            <>
              <Grid item xs={6} md={4}>
                <VirtualizedAutocomplete
                  name="street"
                  label="Улица"
                  options={streets}
                  required
                  loading={isLoadingStreets}
                  autocompleteProps={{
                    disabled: !city,
                    getOptionLabel({ name, nameEn }) {
                      return `${name} - ${nameEn}`;
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextFieldElement
                  variant="standard"
                  name="streetNumber"
                  label="Номер на улица"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextFieldElement
                  variant="standard"
                  name="address1"
                  label="Адрес 1"
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextFieldElement
                  variant="standard"
                  name="address2"
                  label="Адрес 2"
                  fullWidth
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6} md={4}>
                <VirtualizedAutocomplete
                  name="office"
                  label="Офис"
                  options={offices}
                  required
                  loading={isLoadingOffices}
                  autocompleteProps={{
                    disabled: !city,
                    getOptionLabel({ name, nameEn }) {
                      return `${name} - ${nameEn}`;
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextFieldElement
                  variant="standard"
                  name="city"
                  label="Град"
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextFieldElement
                  variant="standard"
                  name="address1"
                  label="Адрес 1"
                  fullWidth
                  disabled
                />
              </Grid>
            </>
          )}
        </Grid>
        <Button
          variant="contained"
          onClick={saveShippingDetails}
          color="primary"
          disabled={!credentials}
        >
          Запази
        </Button>
      </FormContainer>
    </>
  );
}
