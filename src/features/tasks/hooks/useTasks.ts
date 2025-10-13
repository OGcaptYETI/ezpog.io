export function useTasks() {
  // Task state management hook
  return {
    tasks: [],
    loading: false,
    error: null,
  };
}
