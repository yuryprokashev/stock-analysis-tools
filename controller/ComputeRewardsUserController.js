const ConfigService = require("../config/ConfigService");
const DataSourceService = require("../data-source/DataSourceService");
const FactoryService = require("../factory/FactoryService");
const GatewayService = require("../gateway/GatewayService");
const RepositoryService = require("../repository/RepositoryService");
const ComputeRewardsUserRequest = require("./ComputeRewardUserRequest");
const UseCaseService = require("../usecase/UseCaseService");
const ResponderService = require("../responder/ResponderService");


module.exports = ComputeRewardsUserController;
function ComputeRewardsUserController(){
    const _configService = new ConfigService("prod");
    const _dataSources = new DataSourceService();
    const _factories = new FactoryService();
    const _gateways = new GatewayService(_configService.dataSource(), _dataSources);
    const _repositories = new RepositoryService(_configService.gateway(), _gateways, _factories);
    const _useCases = new UseCaseService(_repositories, _factories);
    const _responders = new ResponderService();
    this.onUserRequest = ()=>{
        const useCase = _useCases.getRewardCalculator();
        const responder = _responders.getConsoleResponder(useCase);

        const userRequest = new ComputeRewardsUserRequest("2020-01-02", 0, 10, "buy", 1);
        responder.respond(userRequest);
    };
}