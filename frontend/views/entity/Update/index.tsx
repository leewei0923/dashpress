import { AppLayout } from "../../../_layouts/app";
import {
  ErrorAlert,
  SectionBox,
  SectionCenter,
  Spacer,
} from "@gothicgeeks/design-system";
import { TitleLang } from "@gothicgeeks/shared";
import { NAVIGATION_LINKS } from "../../../lib/routing/links";
import {
  useEntityDiction,
  useEntityFieldLabels,
  useEntityFieldTypes,
  useEntityId,
  useEntitySlug,
  useSelectedEntityColumns,
} from "../../../hooks/entity/entity.config";
import { useEntityScalarFields } from "../../../hooks/entity/entity.store";
import {
  useEntityDataDetails,
  useEntityDataUpdationMutation,
} from "../../../hooks/data/data.store";
import {
  EntityActionTypes,
  useEntityActionMenuItems,
} from "../Configure/constants";
import { useEntityConfiguration } from "../../../hooks/configuration/configration.store";
import { UpdateEntityForm } from "./UpdateEntity.form";
import { fitlerOutHiddenScalarColumns } from "../utils";

// TODO bounce if .update is not enabled
export function EntityUpdate() {
  const entity = useEntitySlug();
  const id = useEntityId();
  const entityDiction = useEntityDiction();
  const entityScalarFields = useEntityScalarFields(entity);
  const entityDataUpdationMutation = useEntityDataUpdationMutation(entity, id);
  const dataDetails = useEntityDataDetails(entity, id);
  const actionItems = useEntityActionMenuItems([
    EntityActionTypes.CRUD,
    EntityActionTypes.Fields,
  ]);
  const entityFieldTypesMap = useEntityConfiguration<Record<string, string>>(
    "entity_columns_types",
    entity
  );
  const entityFieldTypes = useEntityFieldTypes();

  const hiddenUpdateColumns = useSelectedEntityColumns(
    "hidden_entity_update_columns"
  );
  const getEntityFieldLabels = useEntityFieldLabels();

  const error =
    dataDetails.error ||
    hiddenUpdateColumns.error ||
    entityFieldTypesMap.error ||
    entityScalarFields.error;

  return (
    <AppLayout
      titleNeedsContext={true}
      breadcrumbs={[
        {
          label: entityDiction.plural,
          value: NAVIGATION_LINKS.ENTITY.TABLE(entity),
        },
        {
          label: entityDiction.singular,
          value: NAVIGATION_LINKS.ENTITY.DETAILS(entity, id),
        },
        { label: "Update", value: NAVIGATION_LINKS.ENTITY.UPDATE(entity, id) },
      ]}
      actionItems={actionItems}
    >
      <SectionCenter>
        {error ? (
          <>
            <Spacer />
            <ErrorAlert message={error} />
            <Spacer />
          </>
        ) : null}
        <SectionBox
          title={TitleLang.edit(entityDiction.singular)}
          backLink={{
            link: NAVIGATION_LINKS.ENTITY.DETAILS(entity, id),
            label: entityDiction.singular,
          }}
        >
          {dataDetails.isLoading ||
          entityFieldTypesMap.isLoading ||
          hiddenUpdateColumns.isLoading ||
          entityScalarFields.isLoading ? (
            <>TODO Loading Data...</>
          ) : (
            <UpdateEntityForm
              getEntityFieldLabels={getEntityFieldLabels}
              entityFieldTypes={entityFieldTypes}
              onSubmit={entityDataUpdationMutation.mutateAsync}
              fields={fitlerOutHiddenScalarColumns(entityScalarFields, hiddenUpdateColumns)}
              initialValues={dataDetails.data}
            />
          )}
        </SectionBox>
      </SectionCenter>
    </AppLayout>
  );
}