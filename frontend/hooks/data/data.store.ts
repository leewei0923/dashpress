import {
  dataNotFoundMessage,
  makeDeleteRequest,
  makePatchRequest,
  makePostRequest,
  useApi,
  useApiQueries,
  useWaitForResponseMutationOptions,
} from "@gothicgeeks/shared";
import { useRouter } from "next/router";
import { useMutation } from "react-query";
import { SLUG_LOADING_VALUE } from "../../lib/routing/constants";
import { NAVIGATION_LINKS } from "../../lib/routing/links";
import { useEntityDiction } from "../entity/entity.config";

export const ENTITY_TABLE_PATH = (entity: string) =>
  `/api/data/${entity}/table`;

export const ENTITY_COUNT_PATH = (entity: string) =>
  `/api/data/${entity}/count`;

export const ENTITY_DETAILS_PATH = (entity: string, id: string) =>
  `/api/data/${entity}/${id}`;

export const ENTITY_REFERENCE_PATH = (entity: string, id: string) =>
  `/api/data/${entity}/${id}/reference`;

export const useEntityDataDetails = (entity: string, id: string) => {
  const entityDiction = useEntityDiction();

  return useApi<Record<string, string>>(ENTITY_DETAILS_PATH(entity, id), {
    errorMessage: dataNotFoundMessage(entityDiction.singular),
    enabled: !!id && !!entity && id !== SLUG_LOADING_VALUE,
  });
};

export const useEntitiesCount = (entities: string[]) => {
  const entitiesCount = useApiQueries<{ entity: string }, { count: number }>({
    input: entities.map((entity) => ({ entity })),
    accessor: "entity",
    pathFn: (entity) => ENTITY_COUNT_PATH(entity),
  });
  return entitiesCount;
};

export const useEntityDataReference = (entity: string, id: string) =>
  useApi<string>(ENTITY_REFERENCE_PATH(entity, id), {
    errorMessage: dataNotFoundMessage("Reference data not found"),
    enabled: !!(id && entity),
  });

export function useEntityDataCreationMutation(entity: string) {
  const entityDiction = useEntityDiction();
  const router = useRouter();
  const apiMutateOptions = useWaitForResponseMutationOptions<
    Record<string, string>
  >({
    endpoints: [ENTITY_TABLE_PATH(entity), ENTITY_COUNT_PATH(entity)],
    smartSuccessMessage: ({ id }) => ({
      message: `${entityDiction.singular} created successfully`,
      action: {
        label: `Click here to view ${entityDiction.singular}`,
        action: () => router.push(NAVIGATION_LINKS.ENTITY.DETAILS(entity, id)),
      },
    }),
  });

  return useMutation(
    async (data: Record<string, string>) =>
      await makePostRequest(`/api/data/${entity}`, { data }),
    apiMutateOptions
  );
}

export function useEntityDataUpdationMutation(entity: string, id: string) {
  const entityDiction = useEntityDiction();
  const apiMutateOptions = useWaitForResponseMutationOptions<
    Record<string, string>
  >({
    endpoints: [ENTITY_TABLE_PATH(entity), ENTITY_DETAILS_PATH(entity, id)],
    successMessage: `${entityDiction.singular} updated successfully`,
  });

  return useMutation(
    async (data: Record<string, string>) =>
      await makePatchRequest(`/api/data/${entity}/${id}`, { data }),
    apiMutateOptions
  );
}

export function useEntityDataDeletionMutation(entity: string) {
  const entityDiction = useEntityDiction();
  const apiMutateOptions = useWaitForResponseMutationOptions<
    Record<string, string>
  >({
    endpoints: [ENTITY_TABLE_PATH(entity), ENTITY_COUNT_PATH(entity)],
    redirect: NAVIGATION_LINKS.ENTITY.TABLE(entity), // TODO needs to be reworked based on where it is coming from
    successMessage: `${entityDiction.singular} deleted successfully`,
  });

  return useMutation(
    async (id: string) => await makeDeleteRequest(`/api/data/${entity}/${id}`),
    apiMutateOptions
  );
}
