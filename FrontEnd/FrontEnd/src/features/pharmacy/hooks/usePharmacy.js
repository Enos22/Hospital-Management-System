import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMedicine,
  deleteMedicine,
  listMedicines,
  updateMedicine,
} from "../api/pharmacyApi.js";
import { PHARMACY_QUERY_KEY } from "../../../lib/constants.js";

export function usePharmacy({
  page = 1,
  perPage = 10,
  search = "",
} = {}) {
  const queryClient = useQueryClient();
  const queryKey = [...PHARMACY_QUERY_KEY, { page, perPage, search }];
  const inventory = useQuery({
    queryKey,
    queryFn: () => listMedicines({ page, perPage, search }),
  });
  const refreshInventory = () =>
    queryClient.invalidateQueries({ queryKey: PHARMACY_QUERY_KEY });

  const create = useMutation({
    mutationFn: createMedicine,
    onSuccess: refreshInventory,
  });
  const update = useMutation({
    mutationFn: ({ id, changes }) => updateMedicine(id, changes),
    onSuccess: refreshInventory,
  });
  const remove = useMutation({
    mutationFn: deleteMedicine,
    onSuccess: refreshInventory,
  });

  return {
    ...inventory,
    medicines: inventory.data?.medicines ?? [],
    metadata: inventory.data?.metadata ?? null,
    createMedicine: create,
    updateMedicine: update,
    deleteMedicine: remove,
  };
}
