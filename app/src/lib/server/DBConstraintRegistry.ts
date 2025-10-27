import { DataSource, EntityMetadata } from 'typeorm'
import { DatabaseError } from 'pg'

export type EntityConstructor<T = any> = new (...args: any[]) => T

type ConstraintColumnsMap<T> = Map<string, (keyof T)[]>
type RegistryStorage = Map<EntityConstructor, ConstraintColumnsMap<any>>

/**
 * The registry storing for all unique constraints across the entities.
 * Initialized once after the DataSource is ready.
 */
export default class DBConstraintRegistry {
	private readonly dataSource: DataSource
	private storage: RegistryStorage = new Map()

	constructor(dataSource: DataSource) {
		this.dataSource = dataSource
	}

	/**
	 * It builds the internal maps for all registered entities.
	 * Can be called once after the DataSource is initialized.
	 */
	initialize(): void {
		for (const metadata of this.dataSource.entityMetadatas) {
			const entityClass = metadata.target as EntityConstructor
			const map = this.buildConstraintMap(metadata, this.dataSource)

			this.storage.set(entityClass, map)
		}
	}

	private buildConstraintMap(
		metadata: EntityMetadata,
		dataSource: DataSource
	): ConstraintColumnsMap<any> {
		const map = new Map<string, (keyof any)[]>()
		const tableName = metadata.tableName
		const namingStrategy = dataSource.namingStrategy

		/** Processes `@Unique` and `@Column({ unique: true })` entries. */
		for (const unique of metadata.uniques) {
			const columnNames = unique.columns.map((col) => col.propertyName) as (keyof any)[]
			const constraintName = namingStrategy.uniqueConstraintName(tableName, columnNames as string[])

			map.set(constraintName, columnNames)
		}

		/** Processes `@Index({ unique: true })` entries. */
		for (const index of metadata.indices) {
			if (index.isUnique) {
				const columnNames = index.columns.map((col) => col.propertyName) as (keyof any)[]
				const constraintName = index.name || namingStrategy.uniqueConstraintName(tableName, columnNames as string[])

				map.set(constraintName, columnNames)
			}
		}

		return map
	}

	getConstraintColumns<T>(
		entityClass: EntityConstructor<T>,
		constraintName: string
	): (keyof T)[] | undefined {
		const map = this.storage.get(entityClass)

		if (!map) {
			return undefined
		}

		return map.get(constraintName) as (keyof T)[] | undefined
	}

	/**
	 * Checks whether the given error is a unique violation for a specific column.
	 * The check is an O(1) lookup.
	 */
	isConflictOnColumn<T>(
		error: DatabaseError,
		entityClass: EntityConstructor<T>,
		column: keyof T
	): boolean {
		/** Rejects non-unique violations immediately. */
		if (error.code !== '23505') {
			return false
		}

		const constraintName = error.constraint

		if (!constraintName) {
			return false
		}

		const constraintColumns = this.getConstraintColumns(entityClass, constraintName)

		if (!constraintColumns) {
			return false
		}

		/** Returns whether the constraint columns includes the given column. */
		return constraintColumns.includes(column)
	}
}