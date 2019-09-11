exports.up = knex => {

    return knex.schema
        .createTable( 'account_activation', accountActivationTable => {

            accountActivationTable.uuid( 'id' ).primary().unique().notNullable().defaultTo( knex.raw( 'UUID()' ) );
            accountActivationTable.uuid( 'user_id' ).notNullable().references( 'id' ).inTable( 'users' );
            accountActivationTable.boolean( 'is_consumed' ).notNullable().defaultTo( false );
            accountActivationTable.timestamp( 'expires_at' ).notNullable().defaultTo( knex.raw( 'DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE)' ) );
            accountActivationTable.timestamps( false, true );

        } );

};

exports.down = knex => {

    return knex.schema.dropTableIfExists( 'account_activation' );

};
