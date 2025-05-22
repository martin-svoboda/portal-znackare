<?php

namespace PortalZnackare\Functions;

use Dotenv\Dotenv;

class MssqlConnector {
	private $conn;
	private $last_error;

	public function __construct() {
		$env_root = dirname( ABSPATH );
		if ( ! isset( $_ENV['DB_HOST'] ) && file_exists( $env_root . '/.env' ) ) {
			$dotenv = Dotenv::createImmutable( $env_root );
			$dotenv->safeLoad();
		}

		$server   = $_ENV['DB_HOST'] ?? 'localhost';
		$database = $_ENV['DB_NAME'] ?? '';
		$username = $_ENV['DB_USER'] ?? '';
		$password = $_ENV['DB_PASS'] ?? '';

		var_dump($env_root . '/.env');
		var_dump($server);
		die();

		try {
			$dsn        = "sqlsrv:server=$server;Database=$database";
			$this->conn = new \PDO( $dsn, $username, $password );
			$this->conn->setAttribute( \PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION );
		} catch ( \PDOException $e ) {
			$this->conn       = null;
			$this->last_error = $e->getMessage();
		}
	}

	public function hasError(): bool {
		return $this->conn === null;
	}

	public function getError(): \WP_Error {
		return new \WP_Error( 'db_connection_error', 'Chyba připojení k databázi', array(
			'detail' => $this->last_error,
		) );
	}

	public function callProcedure( $procedure, $params = [] ) {
		try {
			$is_named = $this->is_assoc( $params );

			if ( $is_named ) {
				$placeholders = implode( ', ', array_map(
					fn( $key ) => "$key = ?",
					array_keys( $params )
				) );
				$args         = array_values( $params );
			} else {
				$placeholders = implode( ', ', array_fill( 0, count( $params ), '?' ) );
				$args         = $params;
			}

			$sql  = sprintf( "EXEC %s %s", $procedure, $placeholders );
			$stmt = $this->conn->prepare( $sql );
			$stmt->execute( $args );

			return $stmt->fetchAll( \PDO::FETCH_ASSOC );

		} catch ( \PDOException $e ) {
			error_log( 'SQL Procedure error: ' . $e->getMessage() );

			return new \WP_Error( 'sql_error', 'Chyba volání procedury', array( 'exception' => $e->getMessage() ) );
		}
	}

	public function callProcedureMultiple( $procedure, $params = [] ) {
		try {
			$is_named = $this->is_assoc( $params );

			if ( $is_named ) {
				$placeholders = implode( ', ', array_map(
					fn( $key ) => "$key = ?",
					array_keys( $params )
				) );
				$args         = array_values( $params );
			} else {
				$placeholders = implode( ', ', array_fill( 0, count( $params ), '?' ) );
				$args         = $params;
			}

			$sql  = sprintf( "EXEC %s %s", $procedure, $placeholders );
			$stmt = $this->conn->prepare( $sql );
			$stmt->execute( $args );

			$results = [];
			do {
				$results[] = $stmt->fetchAll( \PDO::FETCH_ASSOC );
			} while ( $stmt->nextRowset() );

			return $results;

		} catch ( \PDOException $e ) {
			error_log( 'SQL Procedure (multi) error: ' . $e->getMessage() );

			return new \WP_Error( 'sql_error', 'Chyba volání procedury (více sad)', array( 'exception' => $e->getMessage() ) );
		}
	}

	public function query( $sql, $params = [] ) {
		try {
			$stmt = $this->conn->prepare( $sql );
			$stmt->execute( $params );

			return $stmt->fetchAll( \PDO::FETCH_ASSOC );
		} catch ( \PDOException $e ) {
			error_log( 'SQL error: ' . $e->getMessage() );

			return new \WP_Error( 'sql_error', 'Chyba SQL dotazu', array( 'detail' => $e->getMessage() ) );
		}
	}

	private function is_assoc( array $arr ) {
		if ( array() === $arr ) {
			return false;
		}

		return array_keys( $arr ) !== range( 0, count( $arr ) - 1 );
	}

	public function close() {
		$this->conn = null;
	}
}
