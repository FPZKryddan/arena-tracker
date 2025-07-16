function useFormatter() {
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat().format(value);
  };

  return {
    formatNumber
  }
};

export default useFormatter;