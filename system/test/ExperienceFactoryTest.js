const ExperienceFactory = require("../factory/ExperienceFactory");
const EnvironmentApp = require("../apps/EnvironmentApp");
const RefSymbolPriceFactory = require("../factory/RefSymbolPriceFactory");
const SqlStatementApp = require("../apps/SqlStatementApp");
const ExperienceDTOFactory = require("../factory/ExperienceDTOFactory");
module.exports = (io, configApp)=>{
    QUnit.module("experience-factory", {
        before: ()=>{
            const sqlStatementApp = new SqlStatementApp(io, configApp);
            this.experienceFactory = new ExperienceFactory();
            this.environmentApp = new EnvironmentApp(io, sqlStatementApp, configApp);
            this.experienceDTOFactory = new ExperienceDTOFactory();
        }
    });
    QUnit.test("Can create Experience from current Environment and Reference Environment", assert =>{
        this.currentEnvironment = this.environmentApp.getById("environment-_MSFT-1577982780476");
        this.refEnvironment = this.environmentApp.getById("environment-_MSFT-1577982720779");
        this.experience = this.experienceFactory.create(this.currentEnvironment, this.refEnvironment);
        assert.strictEqual(this.experience.getId(), "environment-_MSFT-1577982780476-environment-_MSFT-1577982720779");
    });
    QUnit.test('Reference Symbol Price is (ask + bid)/2', assert =>{
        this.refSymbolPrice = RefSymbolPriceFactory(this.currentEnvironment);
        assert.strictEqual(this.refSymbolPrice, 158.61);
    });
    QUnit.test("The value of experience parameter is (Current_Env_Parameter_i - Ref_Env_Parameter_j) / Ref_Symbol_Price", assert =>{
        const currentMa10 = this.currentEnvironment.getParameter("ma10");
        const refMa160 = this.refEnvironment.getParameter("ma160");
        const experienceParameterValue = (currentMa10.getValue() - refMa160.getValue())/this.refSymbolPrice;
        this.experienceParameterMa10Ma160 = this.experience.getParameter("current-ma10-ref-ma160");
        assert.strictEqual(this.experienceParameterMa10Ma160.getValue(), experienceParameterValue);
    })
    QUnit.test("The number of parameters in one experience is 7x7 = 49 when Environment parameter count is 7", assert =>{
        assert.strictEqual(this.experience.getParameters().length, 49);
    });
    QUnit.test("The code of the single experience parameter is this parameter value amplified by 10,000 and truncated", assert=>{
        const paramIndex = this.experience.getParameterIndex("current-ma10-ref-ma160");
        const paramCode = this.experience.getCode().split("|")[paramIndex];
        assert.strictEqual(paramCode, "37");
    });
    QUnit.test("Experience => ExperienceDTO", assert =>{
        const experienceDTO = this.experienceDTOFactory.create(this.experience, "vo-1");
        assert.strictEqual(experienceDTO.virtualOrderId, "vo-1");
        assert.strictEqual(experienceDTO.code, "16|11|64|71|78|81|92|21|16|69|76|83|86|97|-38|-43|9|16|23|26|37|-50|-55|-2|4|10|14|25|-59|-64|-11|-4|2|5|16|-63|-69|-15|-8|-2|1|12|-75|-80|-27|-20|-13|-10|0");
    });
}