'use strict'

const path = require('path')
const fs = require('fs')
const SQL = require('sql.js')

let _rowsFromSqlDataObject = function (object) {
  let data = {}
  let i = 0
  let j = 0
  for (let valueArray of object.values) {
    data[i] = {}
    j = 0
    for (let column of object.columns) {
      Object.assign(data[i], {[column]: valueArray[j]})
      j++
    }
    i++
  }
  return data
}

/*
  Return a string of placeholders for use in a prepared statement.
*/
let _placeHoldersString = function (length) {
  let places = ''
  for (let i = 1; i <= length; i++) {
    places += '?, '
  }
  return /(.*),/.exec(places)[1]
}

SQL.dbOpen = function (databaseFileName) {
  try {
    return new SQL.Database(fs.readFileSync(databaseFileName))
  } catch (error) {
    console.log("Can't open database file.", error.message)
    return null
  }
}

SQL.dbClose = function (databaseHandle, databaseFileName) {
  try {
    let data = databaseHandle.export()
    let buffer = new Buffer(data)
    fs.writeFileSync(databaseFileName, buffer)
    databaseHandle.close()
    return true
  } catch (error) {
    console.log("Can't close database file.", error)
    return null
  }
}

/*
  A function to create a new SQLite3 database from schema.sql.

  This function is called from main.js during initialization and that's why
  it's passed appPath. The rest of the model operates from renderer and uses
  window.model.db.
*/
module.exports.initDb = function (appPath, callback) {
  let dbPath = path.join(appPath, 'example.db')
  let createDb = function (dbPath) {
    // Create a database.
    let db = new SQL.Database()
    let query = fs.readFileSync(
    path.join(__dirname, 'db', 'schema.sql'), 'utf8')
    let result = db.exec(query)
    if (Object.keys(result).length === 0 &&
      typeof result.constructor === 'function' &&
      SQL.dbClose(db, dbPath)) {
      console.log('Created a new database.')
    } else {
      console.log('model.initDb.createDb failed.')
    }
  }
  let db = SQL.dbOpen(dbPath)
  if (db === null) {
    /* The file doesn't exist so create a new database. */
    createDb(dbPath)
  } else {
    /*
      The file is a valid sqlite3 database. This simple query will demonstrate
      whether it's in good health or not.
    */
    let query = 'SELECT count(*) as `count` FROM `sqlite_master`'
    let row = db.exec(query)
    let tableCount = parseInt(row[0].values)
    if (tableCount === 0) {
      console.log('The file is an empty SQLite3 database.')
      createDb(dbPath)
    } else {
      console.log('The database has', tableCount, 'tables.')
    }
    if (typeof callback === 'function') {
      callback()
    }
  }
}

/*
  Insert or update form data in the database.
*/
module.exports.saveFormData = function (tableName, keyValue, callback) {
  if (keyValue.columns.length > 0) {
    let db = SQL.dbOpen(window.model.db)
    if (db !== null) {
      let query = 'INSERT OR REPLACE INTO `' + tableName
      query += '` (`' + keyValue.columns.join('`, `') + '`)'
      query += ' VALUES (' + _placeHoldersString(keyValue.values.length) + ')'
			let statement = db.prepare(query)
      try {
        if (statement.run(keyValue.values)) {
					console.log('model.saveFormData', 'Query succeeded for', keyValue.values)
        } else {
          console.log('model.saveFormData', 'Query failed for', keyValue.values)
        }
      } catch (error) {
        console.log('model.saveFormData', error.message)
      } finally {
				let lastInsert = db.exec("select last_insert_rowid();");
				let lastInsertObject = _rowsFromSqlDataObject(lastInsert[0]);
				let lastInsertId = lastInsertObject["0"]["last_insert_rowid()"];

        SQL.dbClose(db, window.model.db)
				if (typeof callback === "function") {
					callback(lastInsertId);
				}
      }
    }
  }
}

/*
  Populates the Question List.
*/
module.exports.getQuestions = function () {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `questions` ORDER BY `question_id` ASC'
    try {
      let row = db.exec(query)
      if (row !== undefined && row.length > 0) {
        row = _rowsFromSqlDataObject(row[0])
				return row
				// console.log(row)
        // view.showQuestions(row)
      }
    } catch (error) {
      console.log('model.getQuestions', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Fetch a question's data from the database.
*/
module.exports.getQuestion = function (qid) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `questions` WHERE `question_id` IS ?'
    let statement = db.prepare(query, [qid])
    try {
      if (statement.step()) {
        let values = [statement.get()]
        let columns = statement.getColumnNames()
        return _rowsFromSqlDataObject({values: values, columns: columns})
      } else {
        console.log('model.getQuestion', 'No data found for question_id =', qid)
      }
    } catch (error) {
      console.log('model.getQuestion', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Fetch a question's  by course_id  from the database.
*/
module.exports.getQuestionsForCourse = function (co_id) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `questions` WHERE `course_id`=?'
    let statement = db.prepare(query, [co_id])
    try {
      let values = [];
      if (statement.step()) {
        let columns = statement.getColumnNames();
        values.push(statement.get());
        while (statement.step()) {
          values.push(statement.get());
        }
        console.log(values);
        console.log(columns);
        return _rowsFromSqlDataObject({values: values, columns: columns});
      } else {
        console.log('model.getQuestionForCourse', 'No data found for course_id =', co_id)
      }
    } catch (error) {
      console.log('model.getQuestionForCourse', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Delete a question's data from the database.
*/
module.exports.deleteQuestion = function (qid, callback) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'DELETE FROM `questions` WHERE `question_id` IS ?'
    let statement = db.prepare(query)
    try {
      if (statement.run([qid])) {
        if (typeof callback === 'function') {
          callback()
        }
      } else {
        console.log('model.deleteQuestion', 'No data found for question_id =', qid)
      }
    } catch (error) {
      console.log('model.deleteQuestion', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Populates the answer List.
*/
module.exports.getOptions = function () {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `options` ORDER BY `option_id` ASC'
    try {
      let row = db.exec(query)
      if (row !== undefined && row.length > 0) {
        row = _rowsFromSqlDataObject(row[0])
        return row
        // console.log(row)
        // view.showOptions(row)
      }
    } catch (error) {
      console.log('model.getOptions', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Fetch an option's data by question_id from the database.
*/
module.exports.getOptionsForQuestion = function (qid) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `options` WHERE `question_id`=(SELECT question_id from questions)'
    let statement = db.prepare(query, [qid])
    try {
      if (statement.step()) {
        let values = [statement.get()]
        let columns = statement.getColumnNames()
        return _rowsFromSqlDataObject({values: values, columns: columns})
      } else {
        console.log('model.getOptionsForQuestion', 'No data found for question_id =', qid)
      }
    } catch (error) {
      console.log('model.getOptionsForQuestion', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Fetch an answer's data from the database.
*/
module.exports.getOption = function (oid) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `options` WHERE `option_id` IS ?'
    let statement = db.prepare(query, [oid])
    try {
      if (statement.step()) {
        let values = [statement.get()]
        let columns = statement.getColumnNames()
        return _rowsFromSqlDataObject({values: values, columns: columns})
      } else {
        console.log('model.getOption', 'No data found for option_id =', oid)
      }
    } catch (error) {
      console.log('model.getOption', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Delete an answer's data of a particular question from the database.
*/
module.exports.deleteOption = function (oid, callback) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'DELETE FROM `options` WHERE `option_id` IS ?'
    let statement = db.prepare(query)
    try {
      if (statement.run([oid])) {
        if (typeof callback === 'function') {
          callback()
        }
      } else {
        console.log('model.deleteOption', 'No data found for option_id =', oid)
      }
    } catch (error) {
      console.log('model.deleteOption', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Populates the course List.
*/
module.exports.getCourses = function () {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `courses` ORDER BY `course_id` ASC'
    try {
      let row = db.exec(query)
      if (row !== undefined && row.length > 0) {
        row = _rowsFromSqlDataObject(row[0])
				return row
				// console.log(row)
        // view.showQuestions(row)
      }
    } catch (error) {
      console.log('model.getCourses', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Fetch a course data from the database.
*/
module.exports.getCourse = function (co_id) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `courses` WHERE `course_id` IS ?'
    let statement = db.prepare(query, [co_id])
    try {
      if (statement.step()) {
        let values = [statement.get()]
        let columns = statement.getColumnNames()
        return _rowsFromSqlDataObject({values: values, columns: columns})
      } else {
        console.log('model.getCourse', 'No data found for course_id =', co_id)
      }
    } catch (error) {
      console.log('model.getCourse', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Delete a course's data from the database.
*/
module.exports.deleteCourse = function (co_id, callback) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'DELETE FROM `courses` WHERE `course_id` IS ?'
    let statement = db.prepare(query)
    try {
      if (statement.run([co_id])) {
        if (typeof callback === 'function') {
          callback();
        }
      } else {
        console.log('model.deleteCourse', 'No data found for course_id =', co_id)
      }
    } catch (error) {
      console.log('model.deleteCourse', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Delete a question set from the database.
*/
module.exports.deleteQuestionSet = function (co_id, callback) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'DELETE FROM `question_sets` WHERE `question_set_id` IS ?'
    let statement = db.prepare(query)
    try {
      if (statement.run([co_id])) {
        if (typeof callback === 'function') {
          callback();
        }
      } else {
        console.log('model.deleteCourse', 'No data found for course_id =', co_id)
      }
    } catch (error) {
      console.log('model.deleteCourse', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Populates the question sets list
*/
module.exports.getQuestionSets = function () {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `question_sets` ORDER BY `question_set_id` ASC'
    try {
      let row = db.exec(query)
      if (row !== undefined && row.length > 0) {
        row = _rowsFromSqlDataObject(row[0])
				return row
      }
    } catch (error) {
      console.log('model.getQuestionSets', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Fetch a question set's data from the database.
*/
module.exports.getQuestionSet = function (qs_id) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `question_sets` WHERE `question_set_id` IS ?'
    let statement = db.prepare(query, [qs_id])
    try {
      if (statement.step()) {
        let values = [statement.get()]
        let columns = statement.getColumnNames()
        return _rowsFromSqlDataObject({values: values, columns: columns})
      } else {
        console.log('model.getQuestionSet', 'No data found for question_set_id =', qid)
      }
    } catch (error) {
      console.log('model.getQuestionSet', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}

/*
  Populates the question set items list for a question set
*/
module.exports.getQuestionSetItems = function (qs_id) {
  let db = SQL.dbOpen(window.model.db)
  if (db !== null) {
    let query = 'SELECT * FROM `question_set_items` WHERE `question_set_id` IS ?'
		let statement = db.prepare(query, [qs_id])
    try {
			let values = [];
      if (statement.step()) {
        let columns = statement.getColumnNames();
        values.push(statement.get());
        while (statement.step()) {
          values.push(statement.get());
        }
        console.log(values);
        console.log(columns);
        return _rowsFromSqlDataObject({values: values, columns: columns});
      }
    } catch (error) {
      console.log('model.getQuestionSetItems', error.message)
    } finally {
      SQL.dbClose(db, window.model.db)
    }
  }
}
