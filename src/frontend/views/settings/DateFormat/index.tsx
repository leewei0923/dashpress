import {
  FormSkeleton,
  FormSkeletonSchema,
  SectionBox,
} from "@hadmean/chromista";
import { useSetPageDetails } from "frontend/lib/routing";
import { USER_PERMISSIONS } from "shared/constants/user";
import {
  useAppConfiguration,
  useUpsertConfigurationMutation,
} from "frontend/hooks/configuration/configuration.store";
import { ViewStateMachine } from "frontend/components/ViewStateMachine";
import { format as dateFnsFormat } from "date-fns";
import { ToastService } from "@hadmean/protozoa";
import { MAKE_APP_CONFIGURATION_CRUD_CONFIG } from "frontend/hooks/configuration/configuration.constant";
import { BaseSettingsLayout } from "../_Base";
import { DateFormatSettingsForm } from "./Form";
import { SETTINGS_VIEW_KEY } from "../constants";

const CRUD_CONFIG = MAKE_APP_CONFIGURATION_CRUD_CONFIG("default_date_format");

export function DateFormatSettings() {
  const defaultDateFormat = useAppConfiguration<string>("default_date_format");

  const upsertConfigurationMutation = useUpsertConfigurationMutation(
    "default_date_format"
  );

  useSetPageDetails({
    pageTitle: CRUD_CONFIG.TEXT_LANG.TITLE,
    viewKey: SETTINGS_VIEW_KEY,
    permission: USER_PERMISSIONS.CAN_CONFIGURE_APP,
  });

  return (
    <BaseSettingsLayout>
      <SectionBox
        title={CRUD_CONFIG.TEXT_LANG.TITLE}
        description="Using format from https://date-fns.org/docs/format"
        iconButtons={[
          {
            action: "https://date-fns.org/docs/format",
            icon: "help",
            label: "Go to https://date-fns.org/docs/format",
          },
        ]}
      >
        <ViewStateMachine
          loading={defaultDateFormat.isLoading}
          error={defaultDateFormat.error}
          loader={<FormSkeleton schema={[FormSkeletonSchema.Input]} />}
        >
          <DateFormatSettingsForm
            onSubmit={async ({ format }) => {
              try {
                dateFnsFormat(new Date(), format);
                await upsertConfigurationMutation.mutateAsync(format);
              } catch (error) {
                ToastService.error(
                  "Invalid Date Format!. Please go to https://date-fns.org/docs/format to see valid formats"
                );
              }
            }}
            initialValues={{ format: defaultDateFormat.data }}
          />
        </ViewStateMachine>
      </SectionBox>
    </BaseSettingsLayout>
  );
}
