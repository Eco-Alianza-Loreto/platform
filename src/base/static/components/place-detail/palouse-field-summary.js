import React from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

import fieldResponseFilter from "../../utils/field-response-filter";
import { RegularTitle, RegularText } from "../atoms/typography";
import { HorizontalRule } from "../atoms/layout";
import CoverImage from "../molecules/cover-image";

import { placePropType } from "../../state/ducks/places";

const ActionSummary = styled("ul")({
  padding: 0,
  marginTop: "32px",
});

const ActionSummaryItem = styled("li")(props => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: props.idx % 2 === 0 ? "#fff8ea" : "#fff",
  padding: "8px 4px 8px 4px",
}));

const SnohomishFieldSummary = props => {
  const fieldConfigs = fieldResponseFilter(props.fields, props.place).filter(
    fieldConfig => props.place[fieldConfig.name] === "yes",
  );
  const numActions = fieldConfigs.length;
  const description = props.place.practices_description;

  return (
    <div>
      <RegularTitle>{numActions} Actions</RegularTitle>
      <HorizontalRule spacing="small" />
      {props.place.attachments
        .filter(attachment => attachment.type === "CO")
        .map((attachment, i) => (
          <CoverImage key={i} imageUrl={attachment.file} />
        ))}
      {description && <RegularText>{description}</RegularText>}
      <ActionSummary>
        {fieldConfigs.map((fieldConfig, idx) => {
          const actionQuantityConfig =
            props.fields.find(
              field => field.name === `${fieldConfig.name}_quantity`,
            ) || {};

          return (
            <ActionSummaryItem key={fieldConfig.name} idx={idx}>
              <RegularText>{fieldConfig.label}</RegularText>
              <RegularText>
                {props.place[actionQuantityConfig.name]}{" "}
                {actionQuantityConfig.metadata &&
                  actionQuantityConfig.metadata.units}
              </RegularText>
            </ActionSummaryItem>
          );
        })}
      </ActionSummary>
    </div>
  );
};

SnohomishFieldSummary.propTypes = {
  fields: PropTypes.array.isRequired,
  place: placePropType.isRequired,
};

export default SnohomishFieldSummary;
