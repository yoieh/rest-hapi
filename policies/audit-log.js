'use strict'

const Boom = require('boom')
const _ = require('lodash')
const config = require('../config')

const internals = {}

/**
 * Policy to log create actions.
 * @param model
 * @param Log
 * @returns {logCreateForModel}
 */
internals.logCreate = function(mongoose, model, Log) {
  const logCreateForModel = async function logCreateForModel(request, h) {
    try {
      Log = Log.bind('logCreate')
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = request.response.source
      if (documents) {
        if (_.isArray(documents)) {
          documents = documents.map(function(doc) {
            return doc._id
          })
        } else {
          documents = [documents._id]
        }
      }

      return AuditLog.create({
        method: 'POST',
        action: 'Create',
        endpoint: request.path,
        user: userId || null,
        collectionName: model.collectionName,
        childCollectionName: null,
        associationType: null,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
        .then(function(result) {
          return h.continue
        })
        .catch(function(err) {
          Log.error('ERROR:', err)
          return h.continue
        })
    } catch (err) {
      Log.error('ERROR:', err)
      return h.continue
    }
  }

  logCreateForModel.applyPoint = 'onPreResponse'
  return logCreateForModel
}
internals.logCreate.applyPoint = 'onPreResponse'

/**
 * Policy to log update actions.
 * @param model
 * @param Log
 * @returns {logUpdateForModel}
 */
internals.logUpdate = function(mongoose, model, Log) {
  const logUpdateForModel = function logUpdateForModel(request, h) {
    try {
      Log = Log.bind('logUpdate')
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = [request.params._id]

      return AuditLog.create({
        method: 'PUT',
        action: 'Update',
        endpoint: request.path,
        user: userId || null,
        collectionName: model.collectionName,
        childCollectionName: null,
        associationType: null,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
        .then(function(result) {
          return h.continue
        })
        .catch(function(err) {
          Log.error('ERROR:', err)
          return h.continue
        })
    } catch (err) {
      Log.error('ERROR:', err)
      return h.continue
    }
  }

  logUpdateForModel.applyPoint = 'onPreResponse'
  return logUpdateForModel
}
internals.logUpdate.applyPoint = 'onPreResponse'

module.exports = {
  logUpdate: internals.logUpdate
}

/**
 * Policy to log delete actions.
 * @param model
 * @param Log
 * @returns {logDeleteForModel}
 */
internals.logDelete = function(mongoose, model, Log) {
  const logDeleteForModel = function logDeleteForModel(request, h) {
    try {
      Log = Log.bind('logDelete')
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = request.params._id || request.payload
      if (_.isArray(documents) && documents[0]._id) {
        documents = documents.map(function(doc) {
          return doc._id
        })
      } else if (!_.isArray(documents)) {
        documents = [documents]
      }

      return AuditLog.create({
        method: 'DELETE',
        action: 'Delete',
        endpoint: request.path,
        user: userId || null,
        collectionName: model.collectionName,
        childCollectionName: null,
        associationType: null,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
        .then(function(result) {
          return h.continue
        })
        .catch(function(err) {
          Log.error('ERROR:', err)
          return h.continue
        })
    } catch (err) {
      Log.error('ERROR:', err)
      return h.continue
    }
  }

  logDeleteForModel.applyPoint = 'onPreResponse'
  return logDeleteForModel
}
internals.logDelete.applyPoint = 'onPreResponse'

module.exports = {
  logDelete: internals.logDelete
}

/**
 * Policy to log add actions.
 * @param model
 * @param Log
 * @returns {logAddForModel}
 */
internals.logAdd = function(
  mongoose,
  ownerModel,
  childModel,
  associationType,
  Log
) {
  const logAddForModel = function logAddForModel(request, h) {
    try {
      Log = Log.bind('logAdd')
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = [request.params.ownerId]

      if (request.params.childId) {
        documents.push(request.params.childId)
      } else {
        request.payload.forEach(function(child) {
          if (child.childId) {
            documents.push(child.childId)
          } else {
            documents.push(child)
          }
        })
      }

      let method = 'POST'

      if (request.method === 'put') {
        method = 'PUT'
      }

      return AuditLog.create({
        method: method,
        action: 'Add',
        endpoint: request.path,
        user: userId || null,
        collectionName: ownerModel.collectionName,
        childCollectionName: childModel.collectionName,
        associationType: associationType,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
        .then(function(result) {
          return h.continue
        })
        .catch(function(err) {
          Log.error('ERROR:', err)
          return h.continue
        })
    } catch (err) {
      Log.error('ERROR:', err)
      return h.continue
    }
  }

  logAddForModel.applyPoint = 'onPreResponse'
  return logAddForModel
}
internals.logAdd.applyPoint = 'onPreResponse'

/**
 * Policy to log remove actions.
 * @param model
 * @param Log
 * @returns {logRemoveForModel}
 */
internals.logRemove = function(
  mongoose,
  ownerModel,
  childModel,
  associationType,
  Log
) {
  const logRemoveForModel = function logRemoveForModel(request, h) {
    try {
      Log = Log.bind('logRemove')
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = [request.params.ownerId]

      if (request.params.childId) {
        documents.push(request.params.childId)
      } else {
        documents = documents.concat(request.payload)
      }

      return AuditLog.create({
        method: 'DELETE',
        action: 'Remove',
        endpoint: request.path,
        user: userId || null,
        collectionName: ownerModel.collectionName,
        childCollectionName: childModel.collectionName,
        associationType: associationType,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
        .then(function(result) {
          return h.continue
        })
        .catch(function(err) {
          Log.error('ERROR:', err)
          return h.continue
        })
    } catch (err) {
      Log.error('ERROR:', err)
      return h.continue
    }
  }

  logRemoveForModel.applyPoint = 'onPreResponse'
  return logRemoveForModel
}
internals.logRemove.applyPoint = 'onPreResponse'

internals.getIP = function(request) {
  // EXPL: We check the headers first in case the server is behind a reverse proxy.
  // see: https://ypereirareis.github.io/blog/2017/02/15/nginx-real-ip-behind-nginx-reverse-proxy/
  return (
    request.headers['x-real-ip'] ||
    request.headers['x-forwarded-for'] ||
    request.info.remoteAddress
  )
}

module.exports = {
  logCreate: internals.logCreate,
  logUpdate: internals.logUpdate,
  logDelete: internals.logDelete,
  logAdd: internals.logAdd,
  logRemove: internals.logRemove
}
