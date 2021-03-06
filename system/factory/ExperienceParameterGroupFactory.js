const ParameterFactory = require("./ParameterFactory");
const ExperienceIdFactory = require("./ExperienceIdFactory");
const ExperienceParameterValueFactory = require("./ExperienceParameterValueFactory");
const RefSymbolPriceFactory = require("./RefSymbolPriceFactory");
const ParameterGroup = require("../model/entity/ParameterGroup");
module.exports = ExperienceParameterGroupFactory;
function ExperienceParameterGroupFactory(){
    const _paramFactory = new ParameterFactory();
    this.create = (currentEnvironment, refEnvironment)=>{
        /*
        Я здесь хочу посчитать разности между Тек Пар i  и Реф Пар j
        то есть если у меня есть к примеру два вектора cur-env и ref-env, формы (ma10, ma20, ma30)
        то я хочу получить матрицу
        |   |                 |     0                          |     1                          |     2                          |
        |   |                 | ref-env-ma-10                  | ref-env-ma-20                  | ref-env-ma-30                  |
        | 0 | cur-env-ma-10   | cur-env-ma-10 - ref-env-ma-10  | cur-env-ma-10 - ref-env-ma-20  | cur-env-ma-10 - ref-env-ma-30  |
        | 1 | cur-env-ma-20   | cur-env-ma-20 - ref-env-ma-10  | cur-env-ma-20 - ref-env-ma-20  | cur-env-ma-20 - ref-env-ma-30  |
        | 2 | cur-env-ma-30   | cur-env-ma-30 - ref-env-ma-10  | cur-env-ma-30 - ref-env-ma-20  | cur-env-ma-30 - ref-env-ma-30  |
        В итоге у меня получится 9 параметров
        |   |                 |     0         |     1         |     2         |
        |   |                 | ref-env-ma-10 | ref-env-ma-20 | ref-env-ma-30 |
        | 0 | cur-env-ma-10   |  d-ma-10-10   |  d-ma-10-20   |  d-ma-10-30   |
        | 1 | cur-env-ma-20   |  d-ma-20-10   |  d-ma-20-20   |  d-ma-20-30   |
        | 2 | cur-env-ma-30   |  d-ma-30-10   |  d-ma-30-20   |  d-ma-30-30   |
         */
        const experienceParameters = [];
        const refSymbolPriceOfCurrentEnvironment = RefSymbolPriceFactory(currentEnvironment);
        currentEnvironment.getParameters().forEach((currentParameter) =>{
            refEnvironment.getParameters().forEach((refParameter) =>{
                const paramObject = {
                    parentId: ExperienceIdFactory(currentEnvironment.getId(), refEnvironment.getId()),
                    name: _experienceParameterName(currentParameter.getName(), refParameter.getName()),
                    value: ExperienceParameterValueFactory(currentParameter.getValue(), refParameter.getValue(), refSymbolPriceOfCurrentEnvironment)
                }
                experienceParameters.push(_paramFactory.fromObject(paramObject));
            });
        });
        return new ParameterGroup(experienceParameters);

    };
    function _experienceParameterName(currentParameterName, refParameterName){
        return `current-${currentParameterName}-ref-${refParameterName}`;
    }
}