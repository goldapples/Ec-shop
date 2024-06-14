const moment = require("moment/moment");
const ProductSales = require("../Models/productSalesModel")
const Category = require("../Models/categoryModel")
const Guest = require("../Models/userModel")
const Manager = require("../Models/userModel")
const Role = require("../Models/roleModel")
const Store = require("../Models/storeModel")
const productSalesModel = require("../Models/productSalesModel")
const curMoment = moment()
const today = curMoment.format("YYYY-MM-DD")
const thisMonth = curMoment.format("YYYY-MM")

exports.nutChart = async (req, res) => {
  try {
    const { startDate, endDate } = req.body?.dateRange
    if (!startDate || !endDate) return res.json({ type: 'error', message: 'No Seleted!' })
    const role = await Role.findOne({ _id: req.user.role })
    if (role.title == 'admin') {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      let all = await ProductSales.aggregate([
        {
          $match: {
            delete: false,
            date: { $gte: sDate, $lte: eDate }
          }
        },
        {
          $group: {
            _id: "$category",
            sales_cnt: { $sum: "$sales_cnt" }
          }
        }
      ]);

      let allCategoryFrom = [];
      for (let i = 0; i < all.length; i++) {
        allCategoryFrom = [...allCategoryFrom, { _id: all[i]?._id, value: all[i].sales_cnt }]

      }

      let result = await ProductSales.aggregate([
        {
          $match: {
            delete: false,
            date: { $gte: sDate, $lte: eDate }
          }
        },
        {
          $group: {
            _id: "$store",
            category: { $push: "$category" },
            cnt: { $push: "$sales_cnt" }
          }
        },

      ]);

      result = result?.map((store) => {
        let tempCategory = [];
        let tempCnt = [];
        store?.category?.map((cate, key) => {
          if (!tempCategory.includes(String(cate))) {
            tempCategory.push(String(cate));
            tempCnt.push(store.cnt[key])
          } else {
            tempCnt[tempCategory.indexOf(String(cate))] += store.cnt[key]
          }
        })
        let category_result = []
        for (let i = 0; i < tempCategory.length; i++) {
          category_result = [...category_result, { _id: tempCategory[i], value: tempCnt[i] }]
        }
        // category_result = tempCategory.map((cate, key) => {return {[cate]: tempCnt[key]}})
        return { ...store, categoryFrom: category_result };
      });
      result = [{ _id: 'all', categoryFrom: allCategoryFrom }, ...result]
      // console.log(result)
      return res.json({ type: 'success', data: result, message: 'Successfully Updated' })
    }
    //userRole == Manager

  } catch (error) {
    // console.log(error)
    res.json({ type: 'error', message: error.message })
  }
}

exports.lineChart = async (req, res) => {
  try {
    const storeIdArray = req.body.storeIdArray;
    const emptyStoreArray = storeIdArray?.map(store => 0)
    const { startDate, endDate } = req.body?.dateRange
    if (!startDate || !endDate) return res.json({ type: 'error', message: 'No Seleted!' })
    const role = await Role.findOne({ _id: req.user.role })
    if (role.title == 'admin') {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);

      const startTime = moment(new Date(startDate)).format("DD");
      const ms = new Date(endDate).valueOf();
      const ms1 = new Date(startDate).valueOf();
      const dateCnt = (ms - ms1) / 3600000 / 24;
      let dateIdArray = [];
      let eachDateData = [];

      for (let i = 1; i <= dateCnt + 1; i++) {
        eachDateData.push(0)
        dateIdArray.push(moment(new Date(startDate).setDate(startTime * 1 + i)).format("YYYY-MM-DD")
        );
      }
      // console.log(dateIdArray)
      // console.log(eachDateData)
      // console.log(storeIdArray)
      // console.log(emptyStoreArray)

      let all = await ProductSales.aggregate([
        {
          $match: {
            delete: false,
            date: { $gte: sDate, $lte: eDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            sales_cnt: { $sum: "$sales_cnt" }
          }
        }
      ]);

      const resultAll = dateIdArray?.map(date => {
        const temp = all.filter(item => item._id == date)
        if (temp.length) {
          return temp[0].sales_cnt;
        }
        else { return 0 }
      });

      //stores and dates
      let result = await ProductSales.aggregate([
        {
          $match: {
            delete: false,
            date: { $gte: sDate, $lte: eDate }
          }
        },
        {
          $group: {

            _id: {
              store: "$store",
              date: {$dateToString: { format: "%Y-%m-%d", date: "$date" }}
            },
            sales_cnt: { $sum: "$sales_cnt" }
          }
        }
      ]);

      const makeStoreData = (data) => {
        const realStoreItemData = dateIdArray?.map(id => {
          const temp = data.filter(item => item?._id?.date == id)
          if (temp.length) {
              return temp[0].sales_cnt
          }
          else return 0
        });
        return realStoreItemData
      }
      let finalData = [];
      finalData = storeIdArray?.map(storeId => {
        const storeItem = result.filter(item => {
          if (item?._id?.store == storeId) return item
          else return
        })
        if (storeItem.length) {
          return {store_id: storeId, data: makeStoreData(storeItem)}
        }
        else {
          return {store_id: storeId, data: eachDateData}
        }
      })

      finalData = [{store_id: 'all', data: resultAll}, ...finalData]
      return res.json({ type: 'success', data: finalData, message: 'Successfully Updated' })

    }


  } catch (error) {
    console.log(error)
    res.json({ type: 'error', message: error.message })
  }
}

/**
 * 
 * @param {*} req  
 * @param {message: String, data: Object, type: String} res 
 */

exports.getStats = async (req, res) => {
  
let sDate = new Date(curMoment.format("YYYY-MM-DD"));
let eDate = new Date(curMoment.format("YYYY-MM-DD"));
sDate.setDate(0);
eDate.setDate(30);
// const thisMonth = curMoment.format("YYYY-MM");
  try {
    const totalSales = await ProductSales.aggregate([
      {
        $match: {
          delete: false,
          date: {$gte: sDate, $lte: eDate}
        }
      },
      {
        $group: {
          _id: "delete",
          totalSales: { $sum: { $multiply: [ "$price", "$sales_cnt" ]} }
        },
      }
    ])
    const category = await Category.aggregate([
      {
        $match: {
          delete: false
        }
      },
      {
        $count: "categoryCnt"
      }
    ])
    const managers = await await Manager.aggregate([
      {
        $match: {
          delete: false
        }
      },
      {
        $count: "managerCnt"
      }
    ])
    const guest = await Guest.aggregate([
      {
        $match: {
          delete: false
        }
      },
      {
        $count: "guestCnt"
      }
    ])
    const data = {
      totalSales: totalSales[0].totalSales,
      categoryCnt: category[0].categoryCnt,
      managerCnt: managers[0].managerCnt,
      guestCnt: guest[0].guestCnt
    }
    res.json({type: 'success', data: data, message: 'Get Dashboard Stats data successfully'})
  } catch (error) {
    console.log(error)
    res.json({type: 'error', message: error.message})
  }
}