<?php

namespace PortalZnackare\Functions;

class MssqlConnector {
	private $conn;

	public function __construct() {
		$server   = "sql8.aspone.cz";
		$database = "db6266";
		$username = "db6266";
		$password = "Dw3?f(H50qkS";

		try {
			$dsn        = "sqlsrv:server=$server;Database=$database";
			$this->conn = new \PDO( $dsn, $username, $password );
			$this->conn->setAttribute( \PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION );
		} catch ( \PDOException $e ) {
			$this->conn = null;
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
				// Např. @Email = ?, @WEBPwdHash = ?
				$placeholders = implode( ', ', array_map(
					fn( $key ) => "$key = ?",
					array_keys( $params )
				) );
				$args = array_values( $params );
			} else {
				// Např. ?, ?
				$placeholders = implode( ', ', array_fill( 0, count( $params ), '?' ) );
				$args = $params;
			}

			$sql = sprintf( "EXEC %s %s", $procedure, $placeholders );
			$stmt = $this->conn->prepare( $sql );
			$stmt->execute( $args );

			return $stmt->fetchAll( \PDO::FETCH_ASSOC );

		} catch ( \PDOException $e ) {
			error_log( 'SQL Procedure error: ' . $e->getMessage() );
			return new \WP_Error( 'sql_error', 'Chyba volání procedury', array( 'exception' => $e->getMessage() ) );
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
		if ( array() === $arr ) return false;
		return array_keys( $arr ) !== range( 0, count( $arr ) - 1 );
	}

	public function close() {
		$this->conn = null;
	}
}
