export interface StatItem {
    label: string;
    value: number;
    compareTo: number;
    isInverted?: boolean;
}
    
export const getStatInfo = (item: StatItem) => {
    const isUp = item.value > item.compareTo;
    const isDown = item.value < item.compareTo;
  
    const isNegative = item.isInverted ? isDown : !isUp && isDown;
    const color = isNegative ? "#D92D20" : "#039855";
  
    const iconPath = isNegative
      ? "M7.26816 13.6632L12.3635 9.70076L11.3032 8.63973L8.5811 11.36L8.5811 2.5L7.0811 2.5L7.0811 11.3556L4.36354 8.63975L3.30321 9.70075L7.26816 13.6632Z"
      : "M7.60141 2.33683L12.6968 6.29924L11.6365 7.36027L8.91435 4.64004L8.91435 13.5L7.41435 13.5L7.41435 4.64442L4.69679 7.36025L3.63646 6.29926L7.60141 2.33683Z";
  
    return { color, iconPath };
};