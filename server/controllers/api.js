const { mysql: config } = require('../config')
var util = require('../tools/util.js');

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.pass,
    database: config.db,
    charset: config.char,
    multipleStatements: true
  }
})

module.exports = {
   //初始化清单
  firstDefaultClassify: async (ctx, next) => {
    await knex.select('classify_id')
      .from('list_classify').where({
        user_id: ctx.state.$wxInfo.userinfo.openId
      })
      .then(rows => {
        if (rows.length == 0) {
            var sql = "INSERT into list_classify(user_id,classify_name,create_time) SELECT ?,t.classify_name,?   FROM `list_classify` t WHERE custom_flag = 0";
            var date = util.formatTime(new Date());
            knex.raw(sql, [ctx.state.$wxInfo.userinfo.openId, date]).catch(function (error) { console.error(error); });
        }
        })
    

  }, 
  //获取所有清单
  getAllClassify: async (ctx, next) => {

    var sql = "SELECT t1.classify_id,  t1.classify_name, t1.create_time,  t1.top_flag,ifnull(count(t2.list_id),0) AS sum FROM `list_classify` t1 LEFT JOIN list_data t2 ON  t1.classify_id = t2.classify_id AND t2.complete_flag = 0  WHERE  t1.user_id = ? GROUP BY  classify_id order by top_flag desc,classify_id";

    await knex.raw(sql, [ctx.state.$wxInfo.userinfo.openId])
      .then(rows =>
        ctx.state.data = rows[0]
       
      )

  }, 
//根据清单Id获取清单内容
  getListByClassId: async (ctx, next) => {
    
    await knex.select('*')
      .from('list_data').where('classify_id', '=', ctx.query.classify_id)
      .then(rows =>
        ctx.state.data = rows
      )

  },
  //新建或保存清单某一条记录
  createOrUpdateList: async (ctx, next) => {
    var list_id = ctx.request.body.list_id;
    if (list_id == null || list_id == ''){
      await knex('list_data').insert({
        classify_id: ctx.request.body.classify_id,
        list_text: ctx.request.body.list_text ,
         create_time: util.formatTime(new Date())
         })
    }else{
      var updateData = {};
      var list_text = ctx.request.body.list_text;
      var complete_flag = ctx.request.body.complete_flag;
      if (list_text && list_text != '') {
        updateData.list_text = list_text;
      }
      if (complete_flag && complete_flag != '') {
        updateData.complete_flag = complete_flag;
      }
      await knex('list_data')
        .where('list_id', '=', list_id)
        .update(updateData)
    }
  },
  //删除清单某一条记录
  delList: async (ctx, next) => {
    var list_id = ctx.request.body.list_id;
      await knex('list_data')
        .where('list_id', list_id)
        .del()
  },
  //删除整个清单
  delClassify: async (ctx, next) => {
    var classify_id = ctx.request.body.classify_id
    await knex('list_data')
      .where('classify_id', classify_id)
      .del().then(function (rows) {
        knex('list_classify')
          .where('classify_id', classify_id)
          .del().catch(function (error) { console.error(error); });
      })
  },
  //新建或修改清单
  createOrUpdateClassify: async (ctx, next) => {
    var classify_id = ctx.request.body.classify_id;
    if (!classify_id || classify_id == '') {
      await knex('list_classify').insert({
        user_id: ctx.state.$wxInfo.userinfo.openId,
        classify_name: ctx.request.body.classify_name,
        create_time: util.formatTime(new Date())
      }).catch(function (error) { console.error(error); });
    } else {
      var classify_name = ctx.request.body.classify_name;
      var top_flag = ctx.request.body.top_flag;
      var complete_flag = ctx.request.body.complete_flag;
      if (complete_flag && complete_flag != '') {
        await knex('list_data')
          .where('classify_id', '=', classify_id).update({
            complete_flag: complete_flag
          }).catch(function (error) { console.error(error); });
      }else{
          var updateData = {};
        if (classify_name && classify_name != ''){
          updateData.classify_name = classify_name;
        }
        if (top_flag && top_flag != '') {
          updateData.top_flag = top_flag;
        }
        await knex('list_classify')
          .where('classify_id', '=', classify_id).update(updateData)
          .catch(function (error) { console.error(error); });
      }
    }
  },
  //批量更新
  batchUpdateComFlag: async (ctx, next) => {
    var checkArr = ctx.request.body
    await knex('list_data')
      .update({complete_flag:0}).then(function (rows) {
        knex('list_data')
          .where(
          knex.raw('list_id in (?)', [checkArr])
        ).update({ complete_flag: 1 })
          .catch(function (error) { console.error(error); });
      })
  },
};
