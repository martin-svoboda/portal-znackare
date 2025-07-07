<?php

namespace PortalZnackare\Managers;

use PortalZnackare\Repositories\MetodikaRepository;
use PortalZnackare\Repositories\ReportRepository;
use PortalZnackareDeps\DI\Container;
use PortalZnackareDeps\Wpify\Model\Manager;

class RepositoryManager {
	public function __construct(
		private Manager $manager,
		Container $container,
		MetodikaRepository $metodika_repository,
		ReportRepository $report_repository
	) {
		foreach ( $manager->get_repositories() as $repository ) {
			$container->set( $repository::class, $repository );
		}

		$this->manager->register_repository( $metodika_repository );
		$this->manager->register_repository( $report_repository );
	}
}
