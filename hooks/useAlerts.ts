import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUserActiveAlerts,
  getTriggeredAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  dismissAlert,
  dismissAllAlerts,
} from "@/lib/actions/alert.actions"
import { toast } from "sonner"

export const alertKeys = {
  all: ["alerts"] as const,
  active: () => [...alertKeys.all, "active"] as const,
  triggered: () => [...alertKeys.all, "triggered"] as const,
}

export function useActiveAlerts(initialData?: Alert[]) {
  return useQuery({
    queryKey: alertKeys.active(),
    queryFn: getUserActiveAlerts,
    initialData,
    refetchInterval: 30_000,
  })
}

export function useTriggeredAlerts(initialData?: Alert[]) {
  return useQuery({
    queryKey: alertKeys.triggered(),
    queryFn: getTriggeredAlerts,
    initialData,
    refetchInterval: 30_000,
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AlertData) => createAlert(data),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message)
        return
      }
      toast.success("Alert created successfully")
      queryClient.invalidateQueries({ queryKey: alertKeys.all })
    },
    onError: () => {
      toast.error("Failed to create alert")
    },
  })
}

export function useUpdateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ alertId, data }: { alertId: string; data: Partial<AlertData> }) => updateAlert(alertId, data),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message)
        return
      }
      toast.success("Alert updated successfully")
      queryClient.invalidateQueries({ queryKey: alertKeys.all })
    },
    onError: () => {
      toast.error("Failed to update alert")
    },
  })
}

export function useDeleteAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertId: string) => deleteAlert(alertId),
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: alertKeys.active() })
      const previous = queryClient.getQueryData<Alert[]>(alertKeys.active())
      queryClient.setQueryData<Alert[]>(alertKeys.active(), (old) => old?.filter((a) => a.id !== alertId))
      return { previous }
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message)
        return
      }
      toast.success("Alert deleted")
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(alertKeys.active(), context?.previous)
      toast.error("Failed to delete alert")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all })
    },
  })
}

export function useDismissAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertId: string) => dismissAlert(alertId),
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: alertKeys.triggered() })
      const previous = queryClient.getQueryData<Alert[]>(alertKeys.triggered())
      queryClient.setQueryData<Alert[]>(alertKeys.triggered(), (old) => old?.filter((a) => a.id !== alertId))
      return { previous }
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(alertKeys.triggered(), context?.previous)
      toast.error("Failed to dismiss alert")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all })
    },
  })
}

export function useDismissAllAlerts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => dismissAllAlerts(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: alertKeys.triggered() })
      const previous = queryClient.getQueryData<Alert[]>(alertKeys.triggered())
      queryClient.setQueryData<Alert[]>(alertKeys.triggered(), [])
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(alertKeys.triggered(), context?.previous)
      toast.error("Failed to dismiss alerts")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all })
    },
  })
}
