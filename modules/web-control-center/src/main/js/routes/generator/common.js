/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var _ = require('lodash');

exports.isDefined = function (v) {
    return !(v === undefined || v === null);
};

exports.mainComment = mainComment;

function mainComment() {
    return 'This configuration was generated by Ignite Control Center ('
        + formatDate(new Date()) + ')';
}

function addLeadingZero(numberStr, minSize) {
    if (typeof (numberStr) != 'string')
        numberStr = '' + numberStr;

    while (numberStr.length < minSize) {
        numberStr = '0' + numberStr;
    }

    return numberStr;
}

exports.formatDate = formatDate;

function formatDate(date) {
    var dd = addLeadingZero(date.getDate(), 2);
    var mm = addLeadingZero(date.getMonth() + 1, 2);

    var yyyy = date.getFullYear();

    return mm + '/' + dd + '/' + yyyy + ' ' + addLeadingZero(date.getHours(), 2) + ':' + addLeadingZero(date.getMinutes(), 2);
}

exports.builder = function () {
    var res = [];

    res.deep = 0;
    res.lineStart = true;

    res.append = function (s) {
        if (this.lineStart) {
            for (var i = 0; i < this.deep; i++)
                this.push('    ');

            this.lineStart = false;
        }

        this.push(s);

        return this;
    };

    res.line = function (s) {
        if (s)
            this.append(s);

        this.push('\n');
        this.lineStart = true;

        return this;
    };

    res.startBlock = function (s) {
        if (s)
            this.append(s);

        this.push('\n');
        this.lineStart = true;
        this.deep++;

        return this;
    };

    res.endBlock = function (s) {
        this.deep--;

        if (s)
            this.append(s);

        this.push('\n');
        this.lineStart = true;

        return this;
    };

    res.emptyLineIfNeeded = function () {
        if (this.needEmptyLine) {
            this.line();

            this.needEmptyLine = false;

            return true;
        }

        return false;
    };

    res.imports = {};

    res.importClass = function (fullClassName) {
        var dotIdx = fullClassName.lastIndexOf('.');

        var shortName;

        if (dotIdx > 0)
            shortName = fullClassName.substr(dotIdx + 1);
        else
            shortName = fullClassName;

        if (this.imports[shortName]) {
            if (this.imports[shortName] != fullClassName)
                throw "Class name conflict: " + this.imports[shortName] + ' and ' + fullClassName;
        }
        else {
            this.imports[shortName] = fullClassName;
        }

        return shortName;
    };

    res.generateImports = function () {
        var res = [];

        for (var clsName in this.imports) {
            if (this.imports.hasOwnProperty(clsName))
                res.push('import ' + this.imports[clsName] + ';');
        }

        return res.join('\n')
    };

    return res;
};

function ClassDescriptor(className, fields) {
    this.className = className;
    this.fields = fields;
}

exports.evictionPolicies = {
    'LRU': new ClassDescriptor('org.apache.ignite.cache.eviction.lru.LruEvictionPolicy',
        {batchSize: null, maxMemorySize: null, maxSize: null}),
    'RND': new ClassDescriptor('org.apache.ignite.cache.eviction.random.RandomEvictionPolicy', {maxSize: null}),
    'FIFO': new ClassDescriptor('org.apache.ignite.cache.eviction.fifo.FifoEvictionPolicy',
        {batchSize: null, maxMemorySize: null, maxSize: null}),
    'SORTED': new ClassDescriptor('org.apache.ignite.cache.eviction.sorted.SortedEvictionPolicy',
        {batchSize: null, maxMemorySize: null, maxSize: null})
};

exports.marshallers = {
    OptimizedMarshaller: new ClassDescriptor('org.apache.ignite.marshaller.optimized.OptimizedMarshaller', {
        poolSize: null,
        requireSerializable: null
    }),
    JdkMarshaller: new ClassDescriptor('org.apache.ignite.marshaller.jdk.JdkMarshaller', {})
};

var javaBuildInClasses = {
    BigDecimal: {className: 'java.math.Boolean'},
    Boolean: {className: 'java.lang.Boolean'},
    Byte: {className: 'java.lang.Byte'},
    Date: {className: 'java.sql.Date'},
    Double: {className: 'java.lang.Double'},
    Float: {className: 'java.lang.Float'},
    Integer: {className: 'java.lang.Integer'},
    Long: {className: 'java.lang.Long'},
    Short: {className: 'java.lang.Short'},
    String: {className: 'java.lang.String'},
    Time: {className: 'java.sql.Time'},
    Timestamp: {className: 'java.sql.Timestamp'},
    UUID: {className: 'java.util.UUID'}
};

exports.javaBuildInClass = function (className) {
    var fullClassName = javaBuildInClasses[className];

    if (fullClassName)
        return fullClassName.className;

    return className;
};

exports.knownClasses = {
    Oracle: new ClassDescriptor('org.apache.ignite.cache.store.jdbc.dialect.OracleDialect', {}),
    DB2: new ClassDescriptor('org.apache.ignite.cache.store.jdbc.dialect.DB2Dialect', {}),
    SQLServer: new ClassDescriptor('org.apache.ignite.cache.store.jdbc.dialect.SQLServerDialect', {}),
    MySQL: new ClassDescriptor('org.apache.ignite.cache.store.jdbc.dialect.MySQLDialect', {}),
    PostgreSQL: new ClassDescriptor('org.apache.ignite.cache.store.jdbc.dialect.BasicJdbcDialect', {}),
    H2: new ClassDescriptor('org.apache.ignite.cache.store.jdbc.dialect.H2Dialect', {})
};

exports.dataSources = {
    Oracle: 'oracle.jdbc.pool.OracleDataSource',
    DB2: 'com.ibm.db2.jcc.DB2ConnectionPoolDataSource',
    SQLServer: 'com.microsoft.sqlserver.jdbc.SQLServerDataSource',
    MySQL: 'com.mysql.jdbc.jdbc2.optional.MysqlDataSource',
    PostgreSQL: 'org.postgresql.ds.PGPoolingDataSource',
    H2: 'org.h2.jdbcx.JdbcDataSource'
};

exports.storeFactories = {
    CacheJdbcPojoStoreFactory: new ClassDescriptor('org.apache.ignite.cache.store.jdbc.CacheJdbcPojoStoreFactory', {
        dataSourceBean: null,
        dialect: {type: 'className'}
    }),

    CacheJdbcBlobStoreFactory: new ClassDescriptor('org.apache.ignite.cache.store.jdbc.CacheJdbcBlobStoreFactory', {
        user: null,
        dataSourceBean: null,
        initSchema: null,
        createTableQuery: null,
        loadQuery: null,
        insertQuery: null,
        updateQuery: null,
        deleteQuery: null
    }),

    CacheHibernateBlobStoreFactory: new ClassDescriptor('org.apache.ignite.cache.store.hibernate.CacheHibernateBlobStoreFactory', {
        hibernateProperties: {type: 'propertiesAsList', propVarName: 'props'}
    })
};

exports.atomicConfiguration = new ClassDescriptor('org.apache.ignite.configuration.AtomicConfiguration', {
    backups: null,
    cacheMode: {type: 'enum', enumClass: 'CacheMode'},
    atomicSequenceReserveSize: null
});

exports.swapSpaceSpi = new ClassDescriptor('org.apache.ignite.spi.swapspace.file.FileSwapSpaceSpi', {
    baseDirectory: null,
    readStripesNumber: null,
    maximumSparsity: {type: 'float'},
    maxWriteQueueSize: null,
    writeBufferSize: null
});

exports.transactionConfiguration = new ClassDescriptor('org.apache.ignite.configuration.TransactionConfiguration', {
    defaultTxConcurrency: {type: 'enum', enumClass: 'TransactionConcurrency'},
    transactionIsolation: {type: 'TransactionIsolation', setterName: 'defaultTxIsolation'},
    defaultTxTimeout: null,
    pessimisticTxLogLinger: null,
    pessimisticTxLogSize: null,
    txSerializableEnabled: null
});

exports.hasProperty = function (obj, props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            if (obj[propName])
                return true;
        }
    }

    return false;
};

/**
 * Convert some name to valid java name.
 *
 * @param name to convert.
 * @returns {string} Valid java name.
 */
exports.toJavaName = function (name) {
    var javaName = name.replace(/[^A-Za-z_0-9]+/, '_');

    return javaName.charAt(0).toLocaleUpperCase() + javaName.slice(1);
};

/**
 * Generate properties file with properties stubs for stores data sources.
 *
 * @param cluster Configuration to process.
 * @returns {string} Generated content.
 */
exports.generateProperties = function (cluster) {
    var res = exports.builder();

    var datasources = [];

    if (cluster.caches && cluster.caches.length > 0) {
        _.forEach(cluster.caches, function (cache) {
            if (cache.cacheStoreFactory && cache.cacheStoreFactory.kind) {
                var storeFactory = cache.cacheStoreFactory[cache.cacheStoreFactory.kind];

                if (storeFactory.dialect) {
                    var beanId = storeFactory.dataSourceBean;

                    if (!_.contains(datasources, beanId)) {
                        datasources.push(beanId);

                        res.line(beanId + '.jdbc.url=YOUR_JDBC_URL');
                        res.line(beanId + '.jdbc.username=YOUR_USER_NAME');
                        res.line(beanId + '.jdbc.password=YOUR_PASSWORD');
                        res.line();
                    }
                }
            }
        });
    }

    if (datasources.length > 0)
        return '# ' + mainComment() + '\n\n' + res.join();

    return undefined;
};
