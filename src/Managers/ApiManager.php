<?php

namespace PortalZnackare\Managers;

use PortalZnackare\Api\InsysApi;
use PortalZnackare\Api\PortalApi;

final class ApiManager {
	/** @var string */
	const PATH = 'portal/v1';

	public function __construct(
		PortalApi $portal_api,
		InsysApi $insys_api
	) {
	}
}
