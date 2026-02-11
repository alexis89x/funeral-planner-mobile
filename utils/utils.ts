import Constants, { ExecutionEnvironment } from "expo-constants";


console.log("EXECUTION ENVIRONMENT: ", Constants.executionEnvironment);

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
