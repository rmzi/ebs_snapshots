# EBS Snapshots 

This repo contains two NodeJS lambda functions used to schedule snapshots of tagged EBS volumes and delete snapshots that are older than their expiry date.

## Installation

Configure Terraform to point to your desired AWS Account. 

## Usage

Run `terraform plan && terraform apply` in the /terraform directory. This will setup CloudWatch Scheduled Events, Targets, and Roles for running the Lambda functions.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

v1.0 - Basic implementation

## TODO

* Allow configurable backup schedule
	* CloudWatch Scheduled Event will still run hourly, but will only back up based on Tag `{ "Backup":"hourly/daily/monthly" }`.
* Set `{ "Snapshot_Retention":"<time (in hours)>" }` on EBS Volume and persist to `Retention` tag on Snapshot. 
	
## Credits

* Shoutout to @steve-Jansen for always pushing me to be better.