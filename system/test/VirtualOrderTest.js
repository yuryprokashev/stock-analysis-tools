/*
sync parse is used. csv api docs: https://csv.js.org/parse/api/sync/
 */
const parse = require("csv-parse/lib/sync");
const VirtualOrderFactory = require("../factory/VirtualOrderFactory");
const TimeBucketFactory = require("../factory/TimeBucketFactory");
const EnvironmentFactory = require("../factory/EnvironmentFactory");
module.exports = (io, configApp)=>{
    QUnit.module("virtual-order", {
        before: ()=>{
            const voFactory = new VirtualOrderFactory();
            const tBucketFactory = new TimeBucketFactory();
            const eFactory = new EnvironmentFactory();
            const recordsFile = io.getFile("C:/Users/yuryp/WebstormProjects/q-learner/system/test/environment-records.csv")

            const bucketJobConfig = {start: 1577982720000, end: 1577982721948, length: 1000, step: 1000};
            const timeBuckets = tBucketFactory.fromConfig(bucketJobConfig);
            const eRecords = parse(recordsFile.getContent(), {columns: true, skip_empty_lines:true, trim: true});
            const environments = eFactory.fromRecords(eRecords);
            timeBuckets.forEach(bucket =>{
                environments.forEach(env=>{
                    if(bucket.includes(env.getCreatedAt())) bucket.add(env);
                });
            });
            this.timeBuckets = timeBuckets;
            this.eRecords = eRecords;
            this.environments = environments;
            this.vo = voFactory.fromEnvironments(timeBuckets[0].getObjects(), timeBuckets[0].getTimeslot().getDuration());
        }
    });
    QUnit.test("Virtual Order Assembly Process", assert =>{
        assert.strictEqual(this.timeBuckets.length, 2, "2 Time buckets are created");
        assert.strictEqual(this.eRecords.length, 2000, "There are 2000 records in the environment-records.csv file");
        assert.strictEqual(this.environments.length, 286, "286 Environments are created");
        assert.strictEqual(this.timeBuckets[0].getObjects().length > 0, true, "First Time Bucket has 3 environments");
    })
    QUnit.test("getId", assert =>{
        assert.strictEqual(this.vo.getId(), "v-order-_MSFT-1577982720000-1-0");
    });
    QUnit.test("Reward and Risk", assert =>{
        assert.strictEqual(this.vo.getParameter("buy-reward").getValue(), -0.07999999999998408, "Buy Reward is computed correctly");
        assert.strictEqual(this.vo.getParameter("sell-reward").getValue(), -0.06999999999999318, "Sell Reward is computed correctly");
        assert.strictEqual(this.vo.getParameter("buy-risk").getValue(), 0.08999999999997499, "Buy Risk is computed correctly");
        assert.strictEqual(this.vo.getParameter("sell-risk").getValue(), 0.07999999999998408, "Sell Risk is computed correctly");
    });
}